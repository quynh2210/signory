import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  orderBy, 
  serverTimestamp,
  writeBatch 
} from './firebase';
import { 
  INITIAL_LESSONS, 
  INITIAL_BLOCKS, 
  INITIAL_QUESTIONS, 
  INITIAL_BADGES, 
  INITIAL_APP_SETTINGS 
} from './seedData';

// Collection references
const LESSONS_COL = 'lessons';
const BLOCKS_COL = 'lessonBlocks';
const QUESTIONS_COL = 'questions';
const PROGRESS_COL = 'userProgress';
const BADGES_COL = 'badges';
const USER_BADGES_COL = 'userBadges';
const USERS_COL = 'users';
const SETTINGS_COL = 'appSettings';
const STORIES_COL = 'stories';
const CHAPTERS_COL = 'chapters';

// Helper for local custom lessons
const getLocalCustomLessons = () => {
  try {
    const raw = localStorage.getItem('signory_custom_lessons');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalCustomLessons = (lessons) => {
  try {
    localStorage.setItem('signory_custom_lessons', JSON.stringify(lessons));
  } catch (e) {}
};

/**
 * Automatically seeds the database if lessons collection is empty
 */
export const seedInitialDataToFirestore = async (force = false) => {
  try {
    const lessonsSnap = await getDocs(collection(db, LESSONS_COL)).catch(() => null);
    if (lessonsSnap && !lessonsSnap.empty && !force) {
      return { success: true, message: 'Already seeded' };
    }

    console.log('Seeding initial SIGNORY data into Firestore...');

    // Seed lessons
    for (const lesson of INITIAL_LESSONS) {
      await setDoc(doc(db, LESSONS_COL, lesson.id), lesson).catch(() => {});
    }

    // Seed blocks
    for (const [lessonId, blocks] of Object.entries(INITIAL_BLOCKS)) {
      for (const block of blocks) {
        await setDoc(doc(db, BLOCKS_COL, block.id), block).catch(() => {});
      }
    }

    // Seed questions
    for (const q of INITIAL_QUESTIONS) {
      await setDoc(doc(db, QUESTIONS_COL, q.id), q).catch(() => {});
    }

    // Seed badges
    for (const b of INITIAL_BADGES) {
      await setDoc(doc(db, BADGES_COL, b.id), b).catch(() => {});
    }

    // Seed app settings
    await setDoc(doc(db, SETTINGS_COL, 'global'), INITIAL_APP_SETTINGS).catch(() => {});

    return { success: true, message: 'Seeded successfully' };
  } catch (error) {
    console.warn('Seeding note (local fallback available):', error);
    return { success: true, message: 'Local seed active' };
  }
};

/**
 * Sanitize object for Firestore (removes undefined values which cause setDoc to throw)
 */
export function sanitizeForFirestore(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      clean[key] = sanitizeForFirestore(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Fetch all lessons for a specific mode or all.
 * Priority: Firestore (source of truth) → localStorage custom → seed fallback only if Firestore fails completely.
 * Note: We query collection without orderBy so Firestore NEVER filters out lessons missing the 'order' field.
 */
export const getLessons = async (mode = 'parents') => {
  let firestoreLessons = [];
  let firestoreOk = false;

  try {
    const lessonsRef = collection(db, LESSONS_COL);
    const snap = await getDocs(lessonsRef);
    snap.forEach(docSnap => {
      firestoreLessons.push({ id: docSnap.id, ...docSnap.data() });
    });
    firestoreOk = true;
  } catch (error) {
    console.warn('Firestore offline, using local fallback:', error.message);
  }

  let allLessons;

  if (firestoreOk) {
    // Firestore is source of truth — also include localStorage lessons NOT in Firestore (created offline)
    const localCustom = getLocalCustomLessons();
    const firestoreIds = new Set(firestoreLessons.map(l => l.id));
    const offlineOnly = localCustom.filter(l => !firestoreIds.has(l.id));
    allLessons = [...firestoreLessons, ...offlineOnly];
  } else {
    // Full offline fallback
    const localCustom = getLocalCustomLessons();
    const mergedMap = new Map();
    INITIAL_LESSONS.forEach(l => mergedMap.set(l.id, l));
    localCustom.forEach(l => mergedMap.set(l.id, l));
    allLessons = Array.from(mergedMap.values());
  }

  allLessons.sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : (Number(a.order) || 999);
    const orderB = typeof b.order === 'number' ? b.order : (Number(b.order) || 999);
    return orderA - orderB;
  });

  if (mode === 'admin') return allLessons;
  return allLessons.filter(l => l.isPublished !== false && (l.mode === mode || l.mode === 'both' || !l.mode));
};

/**
 * Fetch a full lesson with its content blocks and interactive questions.
 * Firestore is the source of truth; localStorage only as offline fallback.
 */
export const getLessonDetails = async (lessonId) => {
  let lessonData = null;
  let blocks = [];
  let questions = [];
  let firestoreOk = false;

  try {
    const lessonRef = doc(db, LESSONS_COL, lessonId);
    const lessonSnap = await getDoc(lessonRef);
    if (lessonSnap.exists()) {
      lessonData = { id: lessonSnap.id, ...lessonSnap.data() };
    }

    const blocksQuery = query(collection(db, BLOCKS_COL), where('lessonId', '==', lessonId));
    const blocksSnap = await getDocs(blocksQuery);
    blocksSnap.forEach(b => blocks.push({ id: b.id, ...b.data() }));
    blocks.sort((a, b) => a.order - b.order);

    const questionsQuery = query(collection(db, QUESTIONS_COL), where('lessonId', '==', lessonId));
    const questionsSnap = await getDocs(questionsQuery);
    questionsSnap.forEach(q => questions.push({ id: q.id, ...q.data() }));
    questions.sort((a, b) => a.order - b.order);

    firestoreOk = true;
  } catch (error) {
    console.warn('Firestore lesson details offline, using local fallback:', error.message);
  }

  // Offline fallbacks only when Firestore unavailable
  if (!firestoreOk) {
    const localCustom = getLocalCustomLessons();
    const foundLocal = localCustom.find(l => l.id === lessonId);
    if (foundLocal) lessonData = foundLocal;

    if (!lessonData) {
      const fallback = INITIAL_LESSONS.find(l => l.id === lessonId);
      if (fallback) lessonData = fallback;
    }

    if (blocks.length === 0 && INITIAL_BLOCKS[lessonId]) {
      blocks = INITIAL_BLOCKS[lessonId];
    }
    if (questions.length === 0) {
      questions = INITIAL_QUESTIONS.filter(q => q.lessonId === lessonId);
    }

    const localBlocks = JSON.parse(localStorage.getItem(`signory_blocks_${lessonId}`) || '[]');
    const localQuestions = JSON.parse(localStorage.getItem(`signory_questions_${lessonId}`) || '[]');
    if (localBlocks.length > 0) blocks = localBlocks;
    if (localQuestions.length > 0) questions = localQuestions;
  }

  return lessonData ? { ...lessonData, blocks, questions } : null;
};

/**
 * Fetch user progress for all lessons (Dual-layer: LocalStorage + Firestore)
 */
export const getUserProgress = async (uid) => {
  if (!uid) return {};
  const localProgress = JSON.parse(localStorage.getItem(`signory_progress_${uid}`) || '{}');

  try {
    const q = query(collection(db, PROGRESS_COL), where('uid', '==', uid));
    const snap = await getDocs(q);
    const progressMap = { ...localProgress };
    snap.forEach(docSnap => {
      const data = docSnap.data();
      progressMap[data.lessonId] = { ...progressMap[data.lessonId], ...data };
    });
    return progressMap;
  } catch (error) {
    return localProgress;
  }
};

/**
 * Save user progress upon completing a lesson
 * Calculations: stars (1 to 3), updates user XP, awards badges, persists locally and syncs Firestore!
 */
export const saveLessonProgress = async ({
  uid,
  lessonId,
  score,
  totalQuestions,
  correctAnswers,
  lessonRewardPoints = 50,
  nextLessonId = null
}) => {
  if (!uid) return { success: false, error: 'User not authenticated' };

  // Calculate stars: 100% -> 3 stars, >= 65% -> 2 stars, otherwise 1 star
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 1;
  let stars = 1;
  if (accuracy >= 0.95) stars = 3;
  else if (accuracy >= 0.65) stars = 2;

  // 1. Read existing local progress
  const localProgressMap = JSON.parse(localStorage.getItem(`signory_progress_${uid}`) || '{}');
  const existingProg = localProgressMap[lessonId];
  const isFirstTime = !existingProg || existingProg.status !== 'completed';

  let xpGained = 0;
  if (isFirstTime) {
    xpGained = lessonRewardPoints + (stars * 10);
  } else {
    if (stars > (existingProg.stars || 0)) {
      xpGained = (stars - existingProg.stars) * 10;
    }
  }

  const finalStars = Math.max(stars, existingProg?.stars || 0);

  const progressRecord = {
    progressId: `${uid}_${lessonId}`,
    uid,
    lessonId,
    status: 'completed',
    score,
    stars: finalStars,
    correctAnswers,
    totalQuestions,
    completedAt: new Date().toISOString()
  };

  // 2. Persist progress to LocalStorage immediately!
  localProgressMap[lessonId] = progressRecord;
  localStorage.setItem(`signory_progress_${uid}`, JSON.stringify(localProgressMap));

  // 3. Update User Profile in LocalStorage immediately!
  const localProfile = JSON.parse(localStorage.getItem(`signory_user_${uid}`) || '{}');
  const newExp = (localProfile.totalExp || 0) + xpGained;
  const newStars = (localProfile.totalStars || 0) + (isFirstTime ? finalStars : Math.max(0, finalStars - (existingProg?.stars || 0)));
  const completedLessons = Array.from(new Set([...(localProfile.completedLessons || []), lessonId]));

  const updatedProfile = {
    ...localProfile,
    uid,
    totalExp: newExp,
    totalStars: newStars,
    completedLessons,
    lastActiveAt: new Date().toISOString()
  };
  localStorage.setItem(`signory_user_${uid}`, JSON.stringify(updatedProfile));

  // 4. Dispatch instant event so AuthContext updates state in Navbar, Profile, Map!
  window.dispatchEvent(new CustomEvent('signory_user_updated', {
    detail: {
      uid,
      totalExp: newExp,
      totalStars: newStars,
      completedLessons
    }
  }));

  // 5. Evaluate Badges
  const newlyAwardedBadges = await evaluateBadges(uid, {
    lessonId,
    stars: finalStars,
    isFirstTime,
    totalCorrect: correctAnswers
  });

  // 6. Attempt Firestore background sync (fails gracefully if restricted)
  try {
    const progressRef = doc(db, PROGRESS_COL, `${uid}_${lessonId}`);
    setDoc(progressRef, { ...progressRecord, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});

    const userRef = doc(db, USERS_COL, uid);
    updateDoc(userRef, {
      totalExp: newExp,
      totalStars: newStars,
      completedLessons,
      lastActiveAt: new Date().toISOString()
    }).catch(() => {});
  } catch (e) {
    console.warn('Firestore progress sync note (Local save successful):', e);
  }

  return {
    success: true,
    stars: finalStars,
    xpGained,
    isFirstTime,
    newlyAwardedBadges
  };
};

/**
 * Automatically evaluate and grant badges
 */
export const evaluateBadges = async (uid, context) => {
  if (!uid) return [];
  const newlyAwarded = [];

  const localBadges = JSON.parse(localStorage.getItem(`signory_badges_${uid}`) || '[]');
  const earnedBadgeIds = new Set(localBadges.map(b => b.badgeId));

  const checkAndAward = (badgeId) => {
    if (!earnedBadgeIds.has(badgeId)) {
      const record = {
        uid,
        badgeId,
        earnedAt: new Date().toISOString()
      };
      localBadges.push(record);
      earnedBadgeIds.add(badgeId);

      const badgeDef = INITIAL_BADGES.find(b => b.id === badgeId);
      if (badgeDef) newlyAwarded.push(badgeDef);

      // Attempt background Firestore sync
      addDoc(collection(db, USER_BADGES_COL), record).catch(() => {});
    }
  };

  // Badge 1: Starter
  checkAndAward('badge-starter');

  // Badge 2: Completed Home
  if (context.lessonId === 'lesson-1-at-home' || context.lessonId === 'lesson-kids-1-home') {
    checkAndAward('badge-first-lesson');
  }

  // Badge 3: 3 Stars
  if (context.stars === 3) {
    checkAndAward('badge-three-stars');
  }

  // Badge 4: Kids Hero
  if (context.lessonId.startsWith('lesson-kids-')) {
    checkAndAward('badge-kids-hero');
  }

  localStorage.setItem(`signory_badges_${uid}`, JSON.stringify(localBadges));
  return newlyAwarded;
};

/**
 * Fetch all available badges and user badges
 */
export const getUserBadges = async (uid) => {
  let allBadges = INITIAL_BADGES;

  try {
    const allBadgesSnap = await getDocs(collection(db, BADGES_COL));
    if (!allBadgesSnap.empty) {
      let remote = [];
      allBadgesSnap.forEach(d => remote.push({ id: d.id, ...d.data() }));
      allBadges = remote;
    }
  } catch (e) {}

  if (!uid) return { allBadges: allBadges.map(b => ({ ...b, isEarned: false })), earnedCount: 0 };

  const localBadges = JSON.parse(localStorage.getItem(`signory_badges_${uid}`) || '[]');
  const earnedSet = new Set(localBadges.map(b => b.badgeId));

  try {
    const userBadgesSnap = await getDocs(query(collection(db, USER_BADGES_COL), where('uid', '==', uid)));
    userBadgesSnap.forEach(d => earnedSet.add(d.data().badgeId));
  } catch (e) {}

  const enriched = allBadges.map(b => ({
    ...b,
    isEarned: earnedSet.has(b.id)
  }));

  return { allBadges: enriched, earnedCount: earnedSet.size };
};

/**
 * Get Leaderboard (sorted by totalExp descending)
 */
export const getLeaderboard = async () => {
  let users = [];
  try {
    const usersRef = collection(db, USERS_COL);
    const q = query(usersRef, orderBy('totalExp', 'desc'));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const data = d.data();
      users.push({
        id: d.id,
        displayName: data.displayName || 'Gia đình Signory',
        totalExp: data.totalExp || 0,
        totalStars: data.totalStars || 0,
        completedCount: (data.completedLessons || []).length
      });
    });
  } catch (e) {}

  // Check current user in local storage to include them on leaderboard
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(k => {
    if (k.startsWith('signory_user_')) {
      try {
        const u = JSON.parse(localStorage.getItem(k));
        if (u && u.uid && !users.find(item => item.id === u.uid)) {
          users.push({
            id: u.uid,
            displayName: u.displayName || 'Gia đình Signory',
            totalExp: u.totalExp || 0,
            totalStars: u.totalStars || 0,
            completedCount: (u.completedLessons || []).length
          });
        }
      } catch (e) {}
    }
  });

  if (users.length === 0) {
    return [
      { id: 'u1', displayName: 'Gia đình Bạn Sóc', totalExp: 280, totalStars: 9, completedCount: 3 },
      { id: 'u2', displayName: 'Mẹ & Bé Bon', totalExp: 220, totalStars: 7, completedCount: 2 },
      { id: 'u3', displayName: 'Bé Thỏ Thông Thái', totalExp: 190, totalStars: 6, completedCount: 2 },
      { id: 'u4', displayName: 'Bố Ken & Tít', totalExp: 150, totalStars: 5, completedCount: 1 }
    ];
  }

  users.sort((a, b) => b.totalExp - a.totalExp);
  return users;
};

/**
 * ADMIN: Save / Update a lesson
 */
export const saveLessonAdmin = async (lessonData) => {
  try {
    const lessonId = lessonData.id || `lesson-${Date.now()}`;
    const payload = sanitizeForFirestore({
      ...lessonData,
      id: lessonId,
      order: typeof lessonData.order === 'number' ? lessonData.order : (Number(lessonData.order) || 999),
      isPublished: lessonData.isPublished !== false,
      updatedAt: new Date().toISOString(),
      createdAt: lessonData.createdAt || new Date().toISOString()
    });

    // Save to local custom lessons for offline cache
    const local = getLocalCustomLessons();
    const idx = local.findIndex(l => l.id === lessonId);
    if (idx >= 0) {
      local[idx] = payload;
    } else {
      local.push(payload);
    }
    saveLocalCustomLessons(local);

    // Save to Firestore and await
    await setDoc(doc(db, LESSONS_COL, lessonId), payload, { merge: true });
    return { success: true, id: lessonId };
  } catch (error) {
    console.error('saveLessonAdmin error:', error);
    throw error;
  }
};

/**
 * ADMIN: Delete a lesson
 */
export const deleteLessonAdmin = async (lessonId) => {
  const local = getLocalCustomLessons().filter(l => l.id !== lessonId);
  saveLocalCustomLessons(local);
  try {
    await deleteDoc(doc(db, LESSONS_COL, lessonId));
  } catch (e) {
    console.warn('deleteLessonAdmin error:', e);
  }
  return { success: true };
};

/**
 * ADMIN: Save blocks for a lesson
 */
export const saveLessonBlocksAdmin = async (lessonId, blocks) => {
  localStorage.setItem(`signory_blocks_${lessonId}`, JSON.stringify(blocks));
  try {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockId = block.id || `block-${lessonId}-${Date.now()}-${i}`;
      const payload = sanitizeForFirestore({
        ...block,
        id: blockId,
        lessonId,
        order: i + 1
      });
      await setDoc(doc(db, BLOCKS_COL, blockId), payload, { merge: true });
    }
  } catch (e) {
    console.warn('saveLessonBlocksAdmin error:', e);
  }
  return { success: true };
};

/**
 * ADMIN: Save a question
 */
export const saveQuestionAdmin = async (questionData) => {
  const qId = questionData.id || `q-${Date.now()}`;
  const payload = sanitizeForFirestore({
    ...questionData,
    id: qId,
    updatedAt: new Date().toISOString()
  });
  
  if (questionData.lessonId) {
    const key = `signory_questions_${questionData.lessonId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = existing.findIndex(q => q.id === qId);
    if (idx >= 0) existing[idx] = payload;
    else existing.push(payload);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  try {
    await setDoc(doc(db, QUESTIONS_COL, qId), payload, { merge: true });
  } catch (e) {
    console.warn('saveQuestionAdmin error:', e);
  }
  return { success: true, id: qId };
};

/**
 * ADMIN: Fetch all users
 */
export const getAllUsersAdmin = async () => {
  const users = [];
  try {
    const snap = await getDocs(collection(db, USERS_COL));
    snap.forEach(d => users.push({ id: d.id, ...d.data() }));
  } catch (e) {}

  // Merge with local users
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('signory_user_')) {
      try {
        const u = JSON.parse(localStorage.getItem(k));
        if (u && !users.find(item => item.id === u.uid)) {
          users.push({ id: u.uid, ...u });
        }
      } catch (e) {}
    }
  });

  return users;
};

/**
 * ADMIN: Toggle user lock
 */
export const toggleUserLockAdmin = async (uid, isLocked) => {
  const localProfile = JSON.parse(localStorage.getItem(`signory_user_${uid}`) || '{}');
  localProfile.isLocked = isLocked;
  localStorage.setItem(`signory_user_${uid}`, JSON.stringify(localProfile));
  updateDoc(doc(db, USERS_COL, uid), { isLocked }).catch(() => {});
  return { success: true };
};

/**
 * ADMIN: Save badge
 */
export const saveBadgeAdmin = async (badgeData) => {
  const badgeId = badgeData.id || `badge-${Date.now()}`;
  setDoc(doc(db, BADGES_COL, badgeId), { ...badgeData, id: badgeId }, { merge: true }).catch(() => {});
  return { success: true, id: badgeId };
};

/**
 * ADMIN: Settings
 */
export const getAppSettings = async () => {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COL, 'global'));
    if (snap.exists()) return snap.data();
  } catch (e) {}
  return INITIAL_APP_SETTINGS;
};

export const saveAppSettings = async (settings) => {
  setDoc(doc(db, SETTINGS_COL, 'global'), settings, { merge: true }).catch(() => {});
  return { success: true };
};


// ─────────────────────────────────────────────────────────────
// STORY → CHAPTER → LESSON HIERARCHY
// ─────────────────────────────────────────────────────────────

/**
 * Get all stories, ordered by order field
 */
export const getStories = async () => {
  try {
    const snap = await getDocs(collection(db, STORIES_COL));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return list;
  } catch (e) {
    console.warn('getStories error:', e.message);
    return [];
  }
};

export const saveStory = async (story) => {
  const clean = sanitizeForFirestore({
    ...story,
    order: Number(story.order) || 1,
    isPublished: story.isPublished !== false,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, STORIES_COL, story.id);
  await setDoc(ref, clean, { merge: true });
  return { success: true };
};

export const deleteStory = async (storyId) => {
  await deleteDoc(doc(db, STORIES_COL, storyId));
  // Also delete all chapters of this story
  const snap = await getDocs(query(collection(db, CHAPTERS_COL), where('storyId', '==', storyId)));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  return { success: true };
};

/**
 * Get chapters for a story, ordered in JavaScript memory (No composite index required!)
 */
export const getChapters = async (storyId) => {
  try {
    const q = query(
      collection(db, CHAPTERS_COL),
      where('storyId', '==', storyId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return list;
  } catch (e) {
    console.warn('getChapters error:', e.message);
    return [];
  }
};

export const getAllChapters = async () => {
  try {
    const snap = await getDocs(collection(db, CHAPTERS_COL));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return list;
  } catch (e) {
    return [];
  }
};

export const saveChapter = async (chapter) => {
  const clean = sanitizeForFirestore({
    ...chapter,
    order: Number(chapter.order) || 1,
    isPublished: chapter.isPublished !== false,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, CHAPTERS_COL, chapter.id);
  await setDoc(ref, clean, { merge: true });
  return { success: true };
};

export const deleteChapter = async (chapterId) => {
  await deleteDoc(doc(db, CHAPTERS_COL, chapterId));
  return { success: true };
};

/**
 * Get lessons belonging to a chapter (No composite index required!)
 */
export const getLessonsByChapter = async (chapterId) => {
  try {
    const q = query(
      collection(db, LESSONS_COL),
      where('chapterId', '==', chapterId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return list;
  } catch (e) {
    console.warn('getLessonsByChapter error:', e.message);
    return [];
  }
};

/**
 * Seed sample Tấm Cám story with 3 chapters and 9 lessons
 */
export const seedTamCamStory = async () => {
  const storyId = 'story-tam-cam';
  const story = {
    id: storyId,
    title: 'Tấm Cám',
    description: 'Học ngôn ngữ ký hiệu qua câu chuyện cổ tích Tấm Cám – một hành trình yêu thương và dũng cảm.',
    coverImage: '',
    order: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  const chapters = [
    { id: 'chapter-tc-1', storyId, title: 'Khởi Đầu Câu Chuyện', description: 'Gặp gỡ nhân vật và làm quen với các ký hiệu đầu tiên.', order: 1, isPublished: true },
    { id: 'chapter-tc-2', storyId, title: 'Khám Phá Cổ Tích', description: 'Theo chân Tấm qua những thử thách và phép màu.', order: 2, isPublished: true },
    { id: 'chapter-tc-3', storyId, title: 'Kết Nối Yêu Thương', description: 'Học ký hiệu về tình cảm gia đình và hạnh phúc.', order: 3, isPublished: true },
  ];

  const lessons = [
    // Chapter 1 – 3 lessons
    { id: `lesson-tc-1-1`, storyId, chapterId: 'chapter-tc-1', title: 'Nhân vật trong truyện', description: 'Học ký hiệu tên các nhân vật: Tấm, Cám, Dì ghẻ.', order: 1, isPublished: true, isLockedByDefault: false, mode: 'parents', rewardPoints: 50, estimatedMinutes: 3, thumbnail: '', topic: 'Nhân vật', createdAt: new Date().toISOString() },
    { id: `lesson-tc-1-2`, storyId, chapterId: 'chapter-tc-1', title: 'Gia đình và nhà cửa', description: 'Các ký hiệu về gia đình và nơi sinh sống.', order: 2, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 50, estimatedMinutes: 3, thumbnail: '', topic: 'Gia đình', createdAt: new Date().toISOString() },
    { id: `lesson-tc-1-3`, storyId, chapterId: 'chapter-tc-1', title: 'Cảm xúc cơ bản', description: 'Vui, buồn, giận – học cách biểu đạt cảm xúc bằng ký hiệu.', order: 3, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 50, estimatedMinutes: 3, thumbnail: '', topic: 'Cảm xúc', createdAt: new Date().toISOString() },
    // Chapter 2 – 3 lessons
    { id: `lesson-tc-2-1`, storyId, chapterId: 'chapter-tc-2', title: 'Yêu cầu và xin phép', description: 'Học cách xin phép và nói yêu cầu bằng ký hiệu.', order: 4, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 60, estimatedMinutes: 3, thumbnail: '', topic: 'Giao tiếp', createdAt: new Date().toISOString() },
    { id: `lesson-tc-2-2`, storyId, chapterId: 'chapter-tc-2', title: 'Màu sắc và vật phẩm', description: 'Ký hiệu về màu sắc, quần áo và vật dụng trong truyện.', order: 5, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 60, estimatedMinutes: 3, thumbnail: '', topic: 'Vật phẩm', createdAt: new Date().toISOString() },
    { id: `lesson-tc-2-3`, storyId, chapterId: 'chapter-tc-2', title: 'Hành động hàng ngày', description: 'Học ký hiệu các động từ: đi, ăn, ngủ, khóc, cười.', order: 6, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 60, estimatedMinutes: 3, thumbnail: '', topic: 'Hành động', createdAt: new Date().toISOString() },
    // Chapter 3 – 3 lessons
    { id: `lesson-tc-3-1`, storyId, chapterId: 'chapter-tc-3', title: 'Yêu thương và quan tâm', description: 'Nói "yêu", "cảm ơn", "xin lỗi" bằng ngôn ngữ ký hiệu.', order: 7, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 70, estimatedMinutes: 3, thumbnail: '', topic: 'Tình cảm', createdAt: new Date().toISOString() },
    { id: `lesson-tc-3-2`, storyId, chapterId: 'chapter-tc-3', title: 'Nơi chốn và không gian', description: 'Ký hiệu về cung điện, ao hồ, rừng núi.', order: 8, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 70, estimatedMinutes: 3, thumbnail: '', topic: 'Nơi chốn', createdAt: new Date().toISOString() },
    { id: `lesson-tc-3-3`, storyId, chapterId: 'chapter-tc-3', title: 'Kết thúc hạnh phúc', description: 'Ôn tập tổng hợp và học ký hiệu về niềm vui, hạnh phúc.', order: 9, isPublished: true, isLockedByDefault: true, mode: 'parents', rewardPoints: 100, estimatedMinutes: 5, thumbnail: '', topic: 'Ôn tập', createdAt: new Date().toISOString() },
  ];

  await setDoc(doc(db, STORIES_COL, storyId), story);
  for (const ch of chapters) {
    await setDoc(doc(db, CHAPTERS_COL, ch.id), ch);
  }
  for (const ls of lessons) {
    await setDoc(doc(db, LESSONS_COL, ls.id), ls, { merge: true });
  }
  return { success: true };
};
