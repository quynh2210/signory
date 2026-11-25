import { getGenerativeModel, Schema } from 'firebase/ai';
import {
  ai,
  db,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from './firebase';
import {
  AI_MODELS,
  AI_GENERATION_CONFIG,
  AI_LIMITS,
  SIGNORY_AI_SYSTEM_INSTRUCTION,
  selectModelTier,
} from '../config/aiConfig';
import {
  getLessons,
  getStories,
  getAllChapters,
  getUserProgress,
  sanitizeForFirestore,
} from './dbService';

const AI_CONVERSATIONS_COL = 'aiConversations';
const AI_MESSAGES_COL = 'aiMessages';
const AI_KNOWLEDGE_COL = 'aiKnowledge';
const BLOCKS_COL = 'lessonBlocks';
const VIDEOS_COL = 'signory_videos';

// Short-lived in-memory reference index to avoid re-fetching Firestore on every single chat turn
let knowledgeCache = {
  fetchedAt: 0,
  ttlMs: 60 * 1000,
  knowledge: [],
  lessons: [],
  blocks: [],
  stories: [],
  chapters: [],
  videos: [],
};

// Client-side rate limit tracking
const rateLimitTracker = {
  lastRequestAt: 0,
  timestamps: [],
};

/** Normalize Vietnamese text (lowercase + remove diacritics) for resilient keyword matching */
export function normalizeVietnamese(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function tokenizeQuery(queryText = '') {
  const norm = normalizeVietnamese(queryText);
  return norm
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
}

function scoreMatch(targetText, rawQuery, tokens) {
  const normTarget = normalizeVietnamese(targetText);
  if (!normTarget) return 0;
  const normQuery = normalizeVietnamese(rawQuery);
  let score = 0;
  if (normQuery && normTarget.includes(normQuery)) score += 10;
  for (const t of tokens) {
    if (normTarget.includes(t)) score += 3;
  }
  return score;
}

/**
 * Load lightweight reference snapshot from Firestore (cached 60s)
 */
async function getReferenceSnapshot(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && knowledgeCache.fetchedAt && now - knowledgeCache.fetchedAt < knowledgeCache.ttlMs) {
    return knowledgeCache;
  }

  const [knowledgeRes, lessonsRes, storiesRes, chaptersRes, blocksRes, videosRes] = await Promise.all([
    getDocs(collection(db, AI_KNOWLEDGE_COL)).catch(() => null),
    getLessons('admin').catch(() => []),
    getStories().catch(() => []),
    getAllChapters().catch(() => []),
    getDocs(collection(db, BLOCKS_COL)).catch(() => null),
    getDocs(collection(db, VIDEOS_COL)).catch(() => null),
  ]);

  const knowledge = [];
  if (knowledgeRes) {
    knowledgeRes.forEach((d) => knowledge.push({ id: d.id, ...d.data() }));
  }

  const blocks = [];
  if (blocksRes) {
    blocksRes.forEach((d) => blocks.push({ id: d.id, ...d.data() }));
  }

  const videos = [];
  if (videosRes) {
    videosRes.forEach((d) => videos.push({ id: d.id, ...d.data() }));
  }

  knowledgeCache = {
    fetchedAt: now,
    ttlMs: 60 * 1000,
    knowledge,
    lessons: lessonsRes || [],
    stories: storiesRes || [],
    chapters: chaptersRes || [],
    blocks,
    videos,
  };

  return knowledgeCache;
}

export function invalidateAIKnowledgeCache() {
  knowledgeCache.fetchedAt = 0;
}

/**
 * Non-blocking cache warmup when the user opens PLUNIS AI
 */
export function warmUpAIKnowledgeCache() {
  getReferenceSnapshot().catch(() => {});
}

// ─────────────────────────────────────────────────────────────
// VERIFIED TOOL HANDLERS (Read-only + Safe UI Navigation)
// ─────────────────────────────────────────────────────────────

async function handleSearchVerifiedSigns({ keyword = '' }, actionCollector) {
  const snapshot = await getReferenceSnapshot();
  const tokens = tokenizeQuery(keyword);
  const results = [];

  // 1. Admin verified knowledge entries
  for (const item of snapshot.knowledge) {
    if (item.verified === false) continue;
    const text = `${item.title || ''} ${item.category || ''} ${item.content || ''} ${(item.keywords || []).join(' ')}`;
    const score = scoreMatch(text, keyword, tokens);
    if (score > 0 || !keyword.trim()) {
      results.push({
        score: score + 5, // boost explicit admin knowledge
        source: 'aiKnowledge',
        id: item.id,
        title: item.title,
        category: item.category || 'sign',
        description: item.content,
        videoUrl: item.videoUrl || null,
        relatedLessonIds: item.relatedLessonIds || [],
      });
      if (item.videoUrl) {
        actionCollector.push({
          id: `vid-${item.id}`,
          type: 'video',
          label: `Xem video: ${item.title}`,
          mediaUrl: item.videoUrl,
        });
      }
      if (item.relatedLessonIds?.length > 0) {
        actionCollector.push({
          id: `lesson-${item.relatedLessonIds[0]}`,
          type: 'lesson',
          label: `Mở bài học liên quan`,
          url: `/lesson/${item.relatedLessonIds[0]}`,
        });
      }
    }
  }

  // 2. Verified lesson blocks (videos, images, sign tips)
  for (const block of snapshot.blocks) {
    const title = block.content?.title || '';
    const desc = block.content?.description || block.content?.body || '';
    const tip = block.content?.tip || block.content?.disclaimer || '';
    const text = `${title} ${desc} ${tip}`;
    const score = scoreMatch(text, keyword, tokens);
    if (score > 0) {
      const parentLesson = snapshot.lessons.find((l) => l.id === block.lessonId);
      if (parentLesson && parentLesson.isPublished === false) continue;
      results.push({
        score,
        source: 'lessonBlock',
        blockType: block.type,
        title: title || parentLesson?.title || 'Nội dung bài học',
        description: desc,
        tip,
        videoUrl: block.type === 'video' ? block.content?.mediaUrl : null,
        imageUrl: block.type === 'image' ? (block.content?.mediaUrl || block.content?.imageUrl) : null,
        lessonId: block.lessonId,
        lessonTitle: parentLesson?.title || null,
      });

      if (block.type === 'video' && block.content?.mediaUrl) {
        actionCollector.push({
          id: `block-vid-${block.id}`,
          type: 'video',
          label: `Xem video: ${title || parentLesson?.title || 'Ký hiệu'}`,
          mediaUrl: block.content.mediaUrl,
        });
      }
      if (block.lessonId) {
        actionCollector.push({
          id: `lesson-${block.lessonId}`,
          type: 'lesson',
          label: `Học ngay: ${parentLesson?.title || 'Bài học'}`,
          url: `/lesson/${block.lessonId}${parentLesson?.mode === 'kids' ? '?mode=kids' : ''}`,
        });
      }
    }
  }

  // 3. Standalone verified QR videos (`signory_videos`)
  for (const v of snapshot.videos) {
    const text = `${v.title || ''} ${v.description || ''} ${v.originalFilename || ''}`;
    const score = scoreMatch(text, keyword, tokens);
    if (score > 0) {
      results.push({
        score,
        source: 'signory_videos',
        title: v.title || v.originalFilename || 'Video ký hiệu',
        description: v.description || 'Video minh họa ký hiệu đã được xác nhận trong thư viện.',
        videoUrl: v.url,
        watchUrl: `/watch/${v.id}`,
      });
      actionCollector.push({
        id: `watch-${v.id}`,
        type: 'video',
        label: `Xem video: ${v.title || 'Ký hiệu'}`,
        mediaUrl: v.url,
        url: `/watch/${v.id}`,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, 6).map(({ score: _score, ...rest }) => rest);

  return {
    found: top.length > 0,
    count: top.length,
    items: top,
    note:
      top.length === 0
        ? 'Không tìm thấy dữ liệu đã được xác minh cho từ khóa này trong Firestore. Không được tự tạo hướng dẫn động tác tay.'
        : 'Dữ liệu đã xác minh từ hệ thống SIGNORY.',
  };
}

async function handleSearchLessonsAndStories({ keyword = '', mode = '' }, actionCollector) {
  const snapshot = await getReferenceSnapshot();
  const tokens = tokenizeQuery(keyword);

  const matchedStories = snapshot.stories
    .filter((s) => s.isPublished !== false)
    .map((s) => {
      const chs = snapshot.chapters.filter((c) => c.storyId === s.id);
      const chText = chs.map((c) => `${c.title} ${c.description}`).join(' ');
      const score = !keyword.trim() ? 1 : scoreMatch(`${s.title} ${s.description} ${chText}`, keyword, tokens);
      return { story: s, chapters: chs, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  matchedStories.forEach(({ story }) => {
    actionCollector.push({
      id: `story-${story.id}`,
      type: 'story',
      label: `Mở truyện: ${story.title}`,
      url: `/stories/${story.id}`,
    });
  });

  const matchedLessons = snapshot.lessons
    .filter((l) => l.isPublished !== false && (!mode || l.mode === mode || l.mode === 'both'))
    .map((l) => {
      const text = `${l.title || ''} ${l.description || ''} ${l.topic || ''} ${(l.signsList || []).join(' ')}`;
      const score = !keyword.trim() ? 1 : scoreMatch(text, keyword, tokens);
      return { lesson: l, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  matchedLessons.forEach(({ lesson }) => {
    actionCollector.push({
      id: `lesson-${lesson.id}`,
      type: 'lesson',
      label: `Học ngay: ${lesson.title}`,
      url: `/lesson/${lesson.id}${lesson.mode === 'kids' ? '?mode=kids' : ''}`,
    });
  });

  return {
    stories: matchedStories.map(({ story, chapters }) => ({
      id: story.id,
      title: story.title,
      description: story.description,
      chaptersCount: chapters.length,
      chapterTitles: chapters.map((c) => c.title),
      url: `/stories/${story.id}`,
    })),
    lessons: matchedLessons.map(({ lesson }) => ({
      id: lesson.id,
      title: lesson.title,
      topic: lesson.topic,
      mode: lesson.mode,
      signsList: lesson.signsList || [],
      description: lesson.description,
      url: `/lesson/${lesson.id}`,
    })),
  };
}

async function handleGetUserProgress({ uid, includeSuggestions = true }, actionCollector) {
  const effectiveUid = uid || 'guest';
  const [progressMap, snapshot] = await Promise.all([
    getUserProgress(effectiveUid),
    getReferenceSnapshot(),
  ]);

  const completedIds = Object.keys(progressMap).filter(
    (id) => progressMap[id]?.status === 'completed' || progressMap[id]?.completed === true
  );

  const publishedLessons = snapshot.lessons.filter((l) => l.isPublished !== false);
  const completedLessons = publishedLessons
    .filter((l) => completedIds.includes(l.id))
    .map((l) => ({ id: l.id, title: l.title, topic: l.topic }));

  const nextLessons = publishedLessons
    .filter((l) => !completedIds.includes(l.id))
    .slice(0, 3)
    .map((l) => ({ id: l.id, title: l.title, topic: l.topic, mode: l.mode }));

  if (includeSuggestions) {
    nextLessons.forEach((l) => {
      actionCollector.push({
        id: `suggest-lesson-${l.id}`,
        type: 'lesson',
        label: `Học tiếp: ${l.title}`,
        url: `/lesson/${l.id}${l.mode === 'kids' ? '?mode=kids' : ''}`,
      });
    });
    if (completedLessons.length > 0) {
      const reviewTarget = completedLessons[0];
      actionCollector.push({
        id: `review-lesson-${reviewTarget.id}`,
        type: 'lesson',
        label: `Ôn tập: ${reviewTarget.title}`,
        url: `/lesson/${reviewTarget.id}`,
      });
    }
  }

  return {
    isAuthenticated: effectiveUid !== 'guest',
    completedCount: completedLessons.length,
    totalAvailableLessons: publishedLessons.length,
    completedLessons,
    suggestedNextLessons: nextLessons,
  };
}

async function handleGetNavigationShortcut({ destination, storyId }, actionCollector) {
  const map = {
    stories: {
      type: 'story',
      label: 'Mở Thư Viện Câu Chuyện',
      url: storyId ? `/stories/${storyId}` : '/stories',
    },
    sign_mirror: {
      type: 'sign_mirror',
      label: 'Mở Luyện Tập SIGN MIRROR',
      url: storyId ? `/stories/${storyId}?tab=mirror` : '/stories',
    },
    parents: {
      type: 'navigation',
      label: 'Mở Bản Đồ Phụ Huynh',
      url: '/parents',
    },
    kids: {
      type: 'navigation',
      label: 'Mở Chế Độ Bé Vui Học',
      url: '/kids',
    },
    circle: {
      type: 'navigation',
      label: 'Mở Cộng Đồng SIGNORY CIRCLE',
      url: '/circle',
    },
    kindness: {
      type: 'navigation',
      label: 'Đến Bức Tường Yêu Thương (Wall of Kindness)',
      url: '/kindness',
    },
    leaderboard: {
      type: 'navigation',
      label: 'Xem Bảng Xếp Hạng',
      url: '/leaderboard',
    },
  };

  const target = map[destination];
  if (!target) {
    return { ok: false, message: 'Điểm đến không hợp lệ.' };
  }

  actionCollector.push({
    id: `nav-${destination}-${storyId || 'all'}`,
    ...target,
  });

  return { ok: true, destination, ...target };
}

const SIGNORY_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_verified_signs_and_knowledge',
        description:
          'Tra cứu thông tin ký hiệu, cách thực hiện, video minh họa và hướng dẫn phụ huynh đã được ADMIN xác minh trong Firestore. BẮT BUỘC gọi khi người dùng hỏi cách làm một ký hiệu cụ thể hoặc hỏi kiến thức trong sách.',
        parameters: Schema.object({
          properties: {
            keyword: Schema.string({
              description: 'Từ khóa ký hiệu hoặc chủ đề cần tìm (ví dụ: ăn, nhà, ngủ, Tấm Cám, yêu thương)',
            }),
          },
        }),
      },
      {
        name: 'search_lessons_and_stories',
        description:
          'Tìm kiếm bài học và câu chuyện trên SIGNORY để gợi ý cho người dùng và tạo nút điều hướng Học ngay / Mở truyện.',
        parameters: Schema.object({
          properties: {
            keyword: Schema.string({
              description: 'Tên câu chuyện, chủ đề hoặc từ khóa bài học (có thể để rỗng để xem các bài nổi bật)',
            }),
            mode: Schema.string({
              description: 'Chế độ lọc tùy chọn: parents, kids hoặc để rỗng',
            }),
          },
          optionalProperties: ['mode'],
        }),
      },
      {
        name: 'get_user_learning_progress',
        description:
          'Xem tiến độ học tập hiện tại của người dùng (số bài đã hoàn thành, gợi ý bài ôn tập và bài tiếp theo).',
        parameters: Schema.object({
          properties: {
            includeSuggestions: Schema.boolean({
              description: 'Có tạo nút gợi ý bài học ôn tập/tiếp theo không',
            }),
          },
          optionalProperties: ['includeSuggestions'],
        }),
      },
      {
        name: 'get_navigation_shortcut',
        description:
          'Tạo nút điều hướng an toàn đến các khu vực của SIGNORY: thư viện truyện, chế độ SIGN MIRROR, Phụ huynh, Bé, SIGNORY CIRCLE, Wall of Kindness, Bảng xếp hạng.',
        parameters: Schema.object({
          properties: {
            destination: Schema.enumString({
              enum: ['stories', 'sign_mirror', 'parents', 'kids', 'circle', 'kindness', 'leaderboard'],
              description: 'Tên khu vực cần điều hướng',
            }),
            storyId: Schema.string({
              description: 'ID câu chuyện nếu mở cụ thể (ví dụ story-tam-cam)',
            }),
          },
          optionalProperties: ['storyId'],
        }),
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// CONVERSATION & MESSAGE PERSISTENCE (Firestore + LocalStorage)
// ─────────────────────────────────────────────────────────────

const localConvKey = (uid) => `signory_ai_convs_${uid || 'guest'}`;
const localMsgKey = (uid, convId) => `signory_ai_msgs_${uid || 'guest'}_${convId}`;

function readLocalConversations(uid) {
  try {
    return JSON.parse(localStorage.getItem(localConvKey(uid)) || '[]');
  } catch {
    return [];
  }
}

function writeLocalConversations(uid, list) {
  try {
    localStorage.setItem(localConvKey(uid), JSON.stringify(list));
  } catch {}
}

function readLocalMessages(uid, convId) {
  try {
    return JSON.parse(localStorage.getItem(localMsgKey(uid, convId)) || '[]');
  } catch {
    return [];
  }
}

function writeLocalMessages(uid, convId, msgs) {
  try {
    localStorage.setItem(localMsgKey(uid, convId), JSON.stringify(msgs.slice(-AI_LIMITS.maxConversationMessagesStored)));
  } catch {}
}

export async function getUserAIConversations(uid) {
  const effectiveUid = uid || 'guest';
  const local = readLocalConversations(effectiveUid);

  if (effectiveUid === 'guest') {
    return local.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }

  try {
    const q = query(collection(db, AI_CONVERSATIONS_COL), where('uid', '==', effectiveUid));
    const snap = await getDocs(q);
    const map = new Map();
    local.forEach((c) => map.set(c.conversationId || c.id, c));
    snap.forEach((d) => {
      const data = d.data();
      map.set(d.id, { id: d.id, conversationId: d.id, ...data });
    });
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );
    writeLocalConversations(effectiveUid, merged);
    return merged;
  } catch (err) {
    console.warn('getUserAIConversations fallback local:', err.message);
    return local.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }
}

export async function createAIConversation(uid, title = 'Cuộc trò chuyện mới') {
  const effectiveUid = uid || 'guest';
  const conversationId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const record = {
    id: conversationId,
    conversationId,
    uid: effectiveUid,
    title,
    summary: '',
    messageCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const local = readLocalConversations(effectiveUid);
  writeLocalConversations(effectiveUid, [record, ...local]);

  if (effectiveUid !== 'guest') {
    setDoc(
      doc(db, AI_CONVERSATIONS_COL, conversationId),
      sanitizeForFirestore({ ...record, serverUpdatedAt: serverTimestamp() })
    ).catch((err) => console.warn('createAIConversation Firestore sync note:', err.message));
  }

  return record;
}

export async function getAIConversationMessages(uid, conversationId) {
  if (!conversationId) return [];
  const effectiveUid = uid || 'guest';
  const local = readLocalMessages(effectiveUid, conversationId);

  if (effectiveUid === 'guest') {
    return local.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }

  try {
    const q = query(
      collection(db, AI_MESSAGES_COL),
      where('conversationId', '==', conversationId),
      where('uid', '==', effectiveUid)
    );
    const snap = await getDocs(q);
    const map = new Map();
    local.forEach((m) => map.set(m.messageId || m.id, m));
    snap.forEach((d) => {
      const data = d.data();
      map.set(d.id, { id: d.id, messageId: d.id, ...data });
    });
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );
    writeLocalMessages(effectiveUid, conversationId, merged);
    return merged;
  } catch (err) {
    console.warn('getAIConversationMessages fallback local:', err.message);
    return local.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }
}

async function persistMessage(uid, conversationId, msg) {
  const effectiveUid = uid || 'guest';
  const existing = readLocalMessages(effectiveUid, conversationId);
  writeLocalMessages(effectiveUid, conversationId, [...existing, msg]);

  if (effectiveUid !== 'guest') {
    setDoc(
      doc(db, AI_MESSAGES_COL, msg.messageId),
      sanitizeForFirestore({ ...msg, serverCreatedAt: serverTimestamp() })
    ).catch((err) => console.warn('persistMessage Firestore sync note:', err.message));
  }
}

async function updateConversationMeta(uid, conversationId, updates) {
  const effectiveUid = uid || 'guest';
  const convs = readLocalConversations(effectiveUid);
  const idx = convs.findIndex((c) => (c.conversationId || c.id) === conversationId);
  if (idx >= 0) {
    convs[idx] = { ...convs[idx], ...updates };
    writeLocalConversations(effectiveUid, convs);
  }

  if (effectiveUid !== 'guest') {
    setDoc(
      doc(db, AI_CONVERSATIONS_COL, conversationId),
      sanitizeForFirestore({ ...updates, serverUpdatedAt: serverTimestamp() }),
      { merge: true }
    ).catch((err) => console.warn('updateConversationMeta note:', err.message));
  }
}

export async function deleteAIConversation(uid, conversationId) {
  const effectiveUid = uid || 'guest';
  const remaining = readLocalConversations(effectiveUid).filter(
    (c) => (c.conversationId || c.id) !== conversationId
  );
  writeLocalConversations(effectiveUid, remaining);
  localStorage.removeItem(localMsgKey(effectiveUid, conversationId));

  if (effectiveUid !== 'guest') {
    try {
      await deleteDoc(doc(db, AI_CONVERSATIONS_COL, conversationId));
      const msgSnap = await getDocs(
        query(
          collection(db, AI_MESSAGES_COL),
          where('conversationId', '==', conversationId),
          where('uid', '==', effectiveUid)
        )
      );
      if (!msgSnap.empty) {
        const batch = writeBatch(db);
        msgSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.warn('deleteAIConversation Firestore note:', err.message);
    }
  }

  return { success: true };
}

export async function clearAllUserAIConversations(uid) {
  const effectiveUid = uid || 'guest';
  const convs = await getUserAIConversations(effectiveUid);
  for (const c of convs) {
    await deleteAIConversation(effectiveUid, c.conversationId || c.id);
  }
  localStorage.removeItem(localConvKey(effectiveUid));
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// CONTEXT CONDENSING & GEMINI EXECUTION
// ─────────────────────────────────────────────────────────────

/**
 * Condense older messages into a concise text summary when conversation exceeds maxHistoryMessagesToModel,
 * keeping token cost low while preserving multi-turn continuity.
 */
function buildPromptHistoryAndSummary(messages = []) {
  const maxRecent = AI_LIMITS.maxHistoryMessagesToModel;
  if (messages.length <= maxRecent) {
    return {
      summaryText: '',
      recentHistory: messages.map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      })),
    };
  }

  const older = messages.slice(0, messages.length - maxRecent);
  const recent = messages.slice(-maxRecent);

  const summarySnippets = older.slice(-6).map((m) => {
    const prefix = m.role === 'model' ? 'AI' : 'Phụ huynh';
    const clean = String(m.content || '').replace(/\s+/g, ' ').slice(0, 95);
    return `- ${prefix}: ${clean}`;
  });

  const summaryText = summarySnippets.join('\n').slice(0, AI_LIMITS.maxSummaryLength);

  return {
    summaryText,
    recentHistory: recent.map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    })),
  };
}

function checkClientRateLimit() {
  const now = Date.now();
  if (now - rateLimitTracker.lastRequestAt < AI_LIMITS.minRequestIntervalMs) {
    throw new Error('RATE_TOO_FAST');
  }
  rateLimitTracker.timestamps = rateLimitTracker.timestamps.filter(
    (ts) => now - ts < AI_LIMITS.rateLimitWindowMs
  );
  if (rateLimitTracker.timestamps.length >= AI_LIMITS.maxRequestsPerWindow) {
    throw new Error('RATE_WINDOW_EXCEEDED');
  }
  rateLimitTracker.lastRequestAt = now;
  rateLimitTracker.timestamps.push(now);
}

const WORKING_MODEL_CACHE_KEY = 'plunis_ai_working_model_v1';
const unavailableModelsSession = new Set();

function readCachedWorkingModel() {
  try {
    return sessionStorage.getItem(WORKING_MODEL_CACHE_KEY) || '';
  } catch {
    return '';
  }
}

function writeCachedWorkingModel(modelName) {
  try {
    if (modelName) sessionStorage.setItem(WORKING_MODEL_CACHE_KEY, modelName);
  } catch {}
}

function getErrorStatus(err) {
  if (typeof err?.customErrorData?.status === 'number') return err.customErrorData.status;
  if (typeof err?.status === 'number') return err.status;
  const match = String(err?.message || '').match(/\b(400|401|403|404|429|500|502|503|504)\b/);
  return match ? Number(match[1]) : 0;
}

function isApiNotEnabledError(err) {
  const msg = String(err?.message || '').toLowerCase();
  const code = String(err?.code || '').toLowerCase();
  return (
    code.includes('api-not-enabled') ||
    msg.includes('api_not_enabled') ||
    msg.includes('has not been used in project') ||
    msg.includes('generativelanguage.googleapis.com') ||
    msg.includes('firebasedeveloper.googleapis.com') ||
    msg.includes('firebaseai.googleapis.com')
  );
}

function isAppCheckError(err) {
  const msg = String(err?.message || '').toLowerCase();
  const code = String(err?.code || '').toLowerCase();
  const status = getErrorStatus(err);
  if (isApiNotEnabledError(err)) return false;
  return (
    code.includes('app-check') ||
    code.includes('appcheck') ||
    msg.includes('app check') ||
    msg.includes('appcheck') ||
    msg.includes('x-firebase-appcheck') ||
    msg.includes('recaptcha') ||
    status === 401
  );
}

function isRetryableModelError(err) {
  const msg = String(err?.message || '').toLowerCase();
  const status = getErrorStatus(err);
  if (isAppCheckError(err) || isApiNotEnabledError(err)) return false;
  if (err?.name === 'AbortError' || msg.includes('timeout') || msg.includes('timed out')) return true;
  if ([400, 404, 429, 500, 502, 503, 504].includes(status)) return true;
  return (
    msg.includes('not found') ||
    msg.includes('is not supported') ||
    msg.includes('unknown model') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('overloaded') ||
    msg.includes('unavailable')
  );
}

/**
 * Decide whether Gemini needs function declarations for this prompt.
 * Basic/general guidance & emotional support prompts finish in 1 fast roundtrip without tools.
 */
function shouldAttachTools(userMessage = '') {
  const norm = normalizeVietnamese(userMessage);
  if (!norm) return false;
  // Remove general phrase "ngôn ngữ ký hiệu" before checking sign-dictionary intent
  const withoutGenericPhrase = norm
    .replace(/ngon ngu ky hieu/g, ' ')
    .replace(/ngon ngu ki hieu/g, ' ');

  const needsSignLookup = /\b(ky hieu|ki hieu|ra dau|thu ngu|video|minh hoa|dien ta|tu vung)\b/.test(
    withoutGenericPhrase
  );
  const needsContentOrProgress =
    /\b(bai hoc|cau chuyen|truyen|chuong|lo trinh|khoa hoc|bai tap|tien do|da hoc|on tap|hoan thanh|huy hieu|diem|xp|thanh tich|lich su hoc)\b/.test(
      norm
    );
  const needsNavigation =
    /\b(mo trang|di toi|chuyen sang|tim o dau|sign mirror|mirror|camera|circle|cong dong|kindness|buc tuong|bang xep hang|che do be)\b/.test(
      norm
    );

  return needsSignLookup || needsContentOrProgress || needsNavigation;
}

function getOrderedModelCandidates(preferredTier) {
  const preferredModel = AI_MODELS[preferredTier] || AI_MODELS.primary;
  const secondaryOption =
    preferredModel === AI_MODELS.secondary ? AI_MODELS.primary : AI_MODELS.secondary;
  const cachedWorking = readCachedWorkingModel();

  const rawList = [
    ...(cachedWorking ? [cachedWorking] : []),
    preferredModel,
    secondaryOption,
    ...(AI_MODELS.verifiedFallbacks || []),
  ];

  const deduped = [];
  for (const name of rawList) {
    if (name && !deduped.includes(name) && !unavailableModelsSession.has(name)) {
      deduped.push(name);
    }
  }
  return deduped.length > 0 ? deduped : (AI_MODELS.verifiedFallbacks || [AI_MODELS.primary]).filter(Boolean);
}

function formatAIErrorMessage(err) {
  const msg = String(err?.message || err || '');
  const lower = msg.toLowerCase();
  const status = getErrorStatus(err);

  if (msg === 'RATE_TOO_FAST') {
    return 'Bạn thao tác hơi nhanh một chút, chờ 1 giây rồi gửi lại giúp mình nhé!';
  }
  if (msg === 'RATE_WINDOW_EXCEEDED') {
    return 'Bạn đã trò chuyện khá nhiều trong ít phút qua. Hãy nghỉ vài phút để mình chuẩn bị năng lượng rồi quay lại đồng hành tiếp nhé!';
  }
  if (isApiNotEnabledError(err)) {
    return 'Dịch vụ Firebase AI Logic (Gemini Developer API) chưa được bật trên Firebase Console cho dự án này.';
  }
  if (isAppCheckError(err)) {
    return 'Xác thực Firebase App Check chưa hợp lệ (trên web cần đúng Site Key reCAPTCHA Enterprise + domain đã cấu hình; khi chạy local cần đăng ký Debug Token trong Firebase Console -> App Check).';
  }
  if (err?.name === 'AbortError' || lower.includes('timeout') || lower.includes('timed out')) {
    return 'PLUNIS AI phản hồi hơi lâu so với dự kiến (quá thời gian chờ). Bạn thử gửi lại giúp mình nhé!';
  }
  if (status === 404 || lower.includes('not found') || lower.includes('is not supported')) {
    return 'Model AI hiện không khả dụng trên cấu hình dự án. Vui lòng kiểm tra cấu hình Gemini model trong Firebase AI Logic.';
  }
  if (status === 429 || lower.includes('quota') || lower.includes('resource_exhausted')) {
    return 'Hạn mức AI tạm thời đã đầy. Bạn vui lòng đợi ít phút rồi thử lại nhé!';
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Kết nối mạng đang ngoại tuyến. Vui lòng kiểm tra Internet để trò chuyện cùng PLUNIS AI.';
  }
  return 'Xin lỗi, PLUNIS AI đang gặp chút trục trặc kết nối. Bạn thử gửi lại sau giây lát nhé!';
}

async function runModelTurn({
  modelName,
  systemInstruction,
  history,
  userMessage,
  uid,
  enableTools = true,
}) {
  const modelOptions = {
    model: modelName,
    systemInstruction,
    generationConfig: AI_GENERATION_CONFIG,
    ...(enableTools ? { tools: SIGNORY_TOOLS } : {}),
  };
  const model = getGenerativeModel(ai, modelOptions);

  const chat = model.startChat({ history });
  const actionCollector = [];
  const reqOpts = { timeout: AI_LIMITS.requestTimeoutMs };

  let result = await chat.sendMessage(userMessage, reqOpts);
  let iterations = 0;

  while (enableTools && iterations < 3) {
    const calls = result?.response?.functionCalls?.();
    if (!calls || calls.length === 0) break;

    iterations += 1;
    const functionResponseParts = [];

    for (const fc of calls) {
      let fnResult = {};
      try {
        if (fc.name === 'search_verified_signs_and_knowledge') {
          fnResult = await handleSearchVerifiedSigns(fc.args || {}, actionCollector);
        } else if (fc.name === 'search_lessons_and_stories') {
          fnResult = await handleSearchLessonsAndStories(fc.args || {}, actionCollector);
        } else if (fc.name === 'get_user_learning_progress') {
          fnResult = await handleGetUserProgress({ uid, ...(fc.args || {}) }, actionCollector);
        } else if (fc.name === 'get_navigation_shortcut') {
          fnResult = await handleGetNavigationShortcut(fc.args || {}, actionCollector);
        } else {
          fnResult = { error: 'Hành động không nằm trong danh sách cho phép.' };
        }
      } catch (toolErr) {
        console.warn(`Tool ${fc.name} error:`, toolErr);
        fnResult = { error: 'Không thể truy vấn dữ liệu lúc này.' };
      }

      functionResponseParts.push({
        type: 'functionResponse',
        functionResponse: {
          ...(fc.id ? { id: fc.id } : {}),
          name: fc.name,
          response: fnResult,
        },
      });
    }

    result = await chat.sendMessage(functionResponseParts, reqOpts);
  }

  const text = result?.response?.text?.() || 'Mình luôn ở đây lắng nghe bạn. Bạn chia sẻ thêm nhé!';

  // Deduplicate actions by id
  const uniqueActions = [];
  const seen = new Set();
  for (const act of actionCollector) {
    if (!seen.has(act.id)) {
      seen.add(act.id);
      uniqueActions.push(act);
    }
  }

  return {
    text,
    actions: uniqueActions.slice(0, 4),
    modelUsed: modelName,
  };
}

/**
 * Send a message to PLUNIS AI, execute verified tools when needed, save conversation & return response
 */
export async function sendMessageToSignoryAI({
  uid,
  conversationId,
  userMessage,
  existingMessages = [],
}) {
  const trimmed = String(userMessage || '').trim();
  if (!trimmed) throw new Error('EMPTY_MESSAGE');

  checkClientRateLimit();

  const effectiveUid = uid || 'guest';
  let activeConvId = conversationId;
  if (!activeConvId) {
    const newConv = await createAIConversation(effectiveUid, trimmed.slice(0, 48));
    activeConvId = newConv.conversationId;
  }

  const userMsgObj = {
    messageId: `msg-u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId: activeConvId,
    uid: effectiveUid,
    role: 'user',
    content: trimmed,
    createdAt: new Date().toISOString(),
  };

  await persistMessage(effectiveUid, activeConvId, userMsgObj);

  const { summaryText, recentHistory } = buildPromptHistoryAndSummary(existingMessages);
  const fullSystemInstruction = summaryText
    ? `${SIGNORY_AI_SYSTEM_INSTRUCTION}\n\n## TÓM TẮT NGỮ CẢNH HỘI THOẠI TRƯỚC ĐÓ\n${summaryText}`
    : SIGNORY_AI_SYSTEM_INSTRUCTION;

  const preferredTier = selectModelTier(trimmed, existingMessages.length);
  const candidates = getOrderedModelCandidates(preferredTier);
  const enableTools = shouldAttachTools(trimmed);

  let aiResponse;
  let lastError = null;

  for (const modelName of candidates) {
    try {
      aiResponse = await runModelTurn({
        modelName,
        systemInstruction: fullSystemInstruction,
        history: recentHistory,
        userMessage: trimmed,
        uid: effectiveUid,
        enableTools,
      });
      writeCachedWorkingModel(modelName);
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      const status = getErrorStatus(err);
      const lower = String(err?.message || '').toLowerCase();
      console.warn(`PLUNIS AI model "${modelName}" failed (status=${status}):`, err);

      if (status === 404 || lower.includes('not found') || lower.includes('is not supported')) {
        unavailableModelsSession.add(modelName);
      }

      // Never bypass App Check or project-level API-not-enabled errors
      if (!isRetryableModelError(err)) {
        throw new Error(formatAIErrorMessage(err));
      }
    }
  }

  if (!aiResponse) {
    throw new Error(formatAIErrorMessage(lastError));
  }

  const aiMsgObj = {
    messageId: `msg-m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId: activeConvId,
    uid: effectiveUid,
    role: 'model',
    content: aiResponse.text,
    actions: aiResponse.actions,
    modelUsed: aiResponse.modelUsed,
    createdAt: new Date().toISOString(),
  };

  await persistMessage(effectiveUid, activeConvId, aiMsgObj);

  const isFirstMessage = existingMessages.length === 0;
  await updateConversationMeta(effectiveUid, activeConvId, {
    ...(isFirstMessage ? { title: trimmed.slice(0, 52) } : {}),
    messageCount: existingMessages.length + 2,
    updatedAt: new Date().toISOString(),
  });

  return {
    conversationId: activeConvId,
    userMessage: userMsgObj,
    aiMessage: aiMsgObj,
  };
}

// ─────────────────────────────────────────────────────────────
// ADMIN KNOWLEDGE BASE CRUD (`aiKnowledge`)
// ─────────────────────────────────────────────────────────────

export async function getAllAIKnowledgeAdmin() {
  try {
    const snap = await getDocs(collection(db, AI_KNOWLEDGE_COL));
    const list = snap.docs.map((d) => ({ id: d.id, knowledgeId: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return list;
  } catch (err) {
    console.warn('getAllAIKnowledgeAdmin error:', err.message);
    return [];
  }
}

export async function saveAIKnowledgeAdmin(item) {
  const knowledgeId = item.id || `know-${Date.now()}`;
  const payload = sanitizeForFirestore({
    ...item,
    id: knowledgeId,
    knowledgeId,
    verified: item.verified !== false,
    keywords: Array.isArray(item.keywords)
      ? item.keywords
      : String(item.keywords || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
    relatedLessonIds: Array.isArray(item.relatedLessonIds) ? item.relatedLessonIds : [],
    updatedAt: new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  });

  await setDoc(doc(db, AI_KNOWLEDGE_COL, knowledgeId), payload, { merge: true });
  invalidateAIKnowledgeCache();
  return { success: true, id: knowledgeId };
}

export async function deleteAIKnowledgeAdmin(knowledgeId) {
  await deleteDoc(doc(db, AI_KNOWLEDGE_COL, knowledgeId));
  invalidateAIKnowledgeCache();
  return { success: true };
}
