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
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from './firebase';
import { sanitizeForFirestore } from './dbService';
import { safeDeleteUserUploadedMedia } from './mediaSafetyService';

const POSTS_COL = 'communityPosts';
const COMMENTS_COL = 'communityComments';
const FOLLOWS_COL = 'communityFollows';
const REPORTS_COL = 'communityReports';
const BLOCKS_COL = 'communityBlocks';
const NOTIFICATIONS_COL = 'communityNotifications';
const MOD_LOGS_COL = 'adminModerationLogs';

const postSpamCooldown = new Map();
const POST_COOLDOWN_MS = 8000;
const COMMENT_COOLDOWN_MS = 3000;

function checkCooldown(key, windowMs) {
  const now = Date.now();
  const prev = postSpamCooldown.get(key) || 0;
  if (now - prev < windowMs) {
    const secs = Math.ceil((windowMs - (now - prev)) / 1000);
    throw new Error(`Bạn thao tác hơi nhanh, vui lòng đợi ${secs} giây rồi thử lại.`);
  }
  postSpamCooldown.set(key, now);
}

// ─────────────────────────────────────────────────────────────
// POSTS CRUD & FEED
// ─────────────────────────────────────────────────────────────

export async function getCommunityPosts({ includeHidden = false } = {}) {
  try {
    const snap = await getDocs(collection(db, POSTS_COL));
    const list = snap.docs
      .map((d) => ({ id: d.id, postId: d.id, ...d.data() }))
      .filter((p) => includeHidden || p.status !== 'hidden');
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (err) {
    console.warn('getCommunityPosts error:', err.message);
    return [];
  }
}

export async function createCommunityPost({
  uid,
  authorName,
  authorRole = 'user',
  content,
  media = [],
  tags = [],
  childSafetyConfirmed = false,
}) {
  if (!uid) throw new Error('Vui lòng đăng nhập để đăng bài chia sẻ.');
  const trimmed = String(content || '').trim();
  if (!trimmed && media.length === 0) {
    throw new Error('Vui lòng nhập nội dung chia sẻ hoặc tải lên ảnh/video.');
  }
  if (media.length > 0 && !childSafetyConfirmed) {
    throw new Error(
      'Vui lòng xác nhận cam kết bảo vệ thông tin nhạy cảm của trẻ và quyền đăng tải của cha mẹ/người giám hộ.'
    );
  }

  checkCooldown(`post:${uid}`, POST_COOLDOWN_MS);

  const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();

  const record = sanitizeForFirestore({
    id: postId,
    postId,
    uid,
    authorName: authorName || 'Gia đình Signory',
    authorRole,
    content: trimmed,
    media,
    tags,
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    childSafetyConfirmed: Boolean(childSafetyConfirmed),
    status: 'active',
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await setDoc(doc(db, POSTS_COL, postId), {
    ...record,
    serverCreatedAt: serverTimestamp(),
  });

  return record;
}

export async function updateOwnCommunityPost({ postId, uid, content, tags }) {
  if (!uid) throw new Error('Vui lòng đăng nhập.');
  const ref = doc(db, POSTS_COL, postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Bài viết không tồn tại.');
  if (snap.data().uid !== uid) {
    throw new Error('Bạn chỉ có thể chỉnh sửa bài viết của chính mình.');
  }

  const trimmed = String(content || '').trim();
  if (!trimmed) throw new Error('Nội dung không được để trống.');

  const updates = sanitizeForFirestore({
    content: trimmed,
    ...(tags ? { tags } : {}),
    updatedAt: new Date().toISOString(),
  });

  await updateDoc(ref, updates);
  return { success: true, updates };
}

export async function deleteCommunityPost({ postId, actorUid, isAdmin = false, reason = '' }) {
  if (!actorUid) throw new Error('Vui lòng đăng nhập.');
  const ref = doc(db, POSTS_COL, postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { success: true };

  const postData = snap.data();
  const isOwner = postData.uid === actorUid;
  if (!isOwner && !isAdmin) {
    throw new Error('Bạn không có quyền xóa bài viết này.');
  }

  // Safely remove uploaded media if not used in educational content
  if (Array.isArray(postData.media)) {
    for (const m of postData.media) {
      await safeDeleteUserUploadedMedia(m);
    }
  }

  // Delete comments of this post
  const cSnap = await getDocs(query(collection(db, COMMENTS_COL), where('postId', '==', postId)));
  if (!cSnap.empty) {
    const batch = writeBatch(db);
    cSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  await deleteDoc(ref);

  if (isAdmin && !isOwner) {
    await logAdminModeration({
      adminUid: actorUid,
      action: 'delete_post',
      targetType: 'communityPost',
      targetId: postId,
      reason: reason || 'Xóa bài đăng không phù hợp',
    });
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// LIKES & NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export async function toggleLikePost({ postId, uid, userName }) {
  if (!uid) throw new Error('Vui lòng đăng nhập để thả tim bài viết.');
  const ref = doc(db, POSTS_COL, postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Bài viết không tồn tại.');

  const data = snap.data();
  const currentLikes = Array.isArray(data.likes) ? data.likes : [];
  const hasLiked = currentLikes.includes(uid);
  const updatedLikes = hasLiked
    ? currentLikes.filter((id) => id !== uid)
    : [...currentLikes, uid];

  await updateDoc(ref, {
    likes: updatedLikes,
    likesCount: updatedLikes.length,
  });

  if (!hasLiked && data.uid && data.uid !== uid) {
    await createNotification({
      recipientUid: data.uid,
      actorUid: uid,
      actorName: userName || 'Thành viên Signory',
      type: 'like',
      postId,
      message: `${userName || 'Một thành viên'} đã thích bài chia sẻ của bạn.`,
    });
  }

  return { liked: !hasLiked, likes: updatedLikes, likesCount: updatedLikes.length };
}

// ─────────────────────────────────────────────────────────────
// COMMENTS & REPLIES
// ─────────────────────────────────────────────────────────────

export async function getCommentsForPost(postId, { includeHidden = false } = {}) {
  try {
    const q = query(collection(db, COMMENTS_COL), where('postId', '==', postId));
    const snap = await getDocs(q);
    const list = snap.docs
      .map((d) => ({ id: d.id, commentId: d.id, ...d.data() }))
      .filter((c) => includeHidden || c.status !== 'hidden');
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    return list;
  } catch (err) {
    console.warn('getCommentsForPost error:', err.message);
    return [];
  }
}

export async function getAllCommentsAdmin() {
  try {
    const snap = await getDocs(collection(db, COMMENTS_COL));
    const list = snap.docs.map((d) => ({ id: d.id, commentId: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (err) {
    return [];
  }
}

export async function addCommentToPost({
  postId,
  postAuthorUid,
  uid,
  authorName,
  content,
  parentCommentId = null,
}) {
  if (!uid) throw new Error('Vui lòng đăng nhập để bình luận.');
  const trimmed = String(content || '').trim();
  if (!trimmed) throw new Error('Nội dung bình luận không được để trống.');

  checkCooldown(`comment:${uid}`, COMMENT_COOLDOWN_MS);

  const commentId = `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();
  const record = sanitizeForFirestore({
    id: commentId,
    commentId,
    postId,
    uid,
    authorName: authorName || 'Gia đình Signory',
    parentCommentId: parentCommentId || null,
    content: trimmed,
    status: 'active',
    createdAt: nowIso,
  });

  await setDoc(doc(db, COMMENTS_COL, commentId), record);

  // Increment post commentsCount safely
  try {
    const postRef = doc(db, POSTS_COL, postId);
    const pSnap = await getDoc(postRef);
    if (pSnap.exists()) {
      await updateDoc(postRef, {
        commentsCount: (pSnap.data().commentsCount || 0) + 1,
      });
    }
  } catch {}

  if (postAuthorUid && postAuthorUid !== uid) {
    await createNotification({
      recipientUid: postAuthorUid,
      actorUid: uid,
      actorName: authorName || 'Thành viên Signory',
      type: 'comment',
      postId,
      message: `${authorName || 'Một thành viên'} đã bình luận: "${trimmed.slice(0, 45)}"`,
    });
  }

  return record;
}

export async function deleteCommunityComment({ commentId, postId, actorUid, isAdmin = false }) {
  if (!actorUid) throw new Error('Vui lòng đăng nhập.');
  const ref = doc(db, COMMENTS_COL, commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { success: true };

  const cData = snap.data();
  const isOwner = cData.uid === actorUid;
  if (!isOwner && !isAdmin) {
    throw new Error('Bạn không có quyền xóa bình luận này.');
  }

  await deleteDoc(ref);

  if (postId) {
    try {
      const postRef = doc(db, POSTS_COL, postId);
      const pSnap = await getDoc(postRef);
      if (pSnap.exists()) {
        await updateDoc(postRef, {
          commentsCount: Math.max(0, (pSnap.data().commentsCount || 1) - 1),
        });
      }
    } catch {}
  }

  if (isAdmin && !isOwner) {
    await logAdminModeration({
      adminUid: actorUid,
      action: 'delete_comment',
      targetType: 'communityComment',
      targetId: commentId,
      reason: 'Xóa bình luận không phù hợp',
    });
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// FOLLOWS & PUBLIC PROFILES
// ─────────────────────────────────────────────────────────────

export async function getAllFollows() {
  try {
    const snap = await getDocs(collection(db, FOLLOWS_COL));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function toggleFollowUser({ followerUid, followingUid, followerName }) {
  if (!followerUid) throw new Error('Vui lòng đăng nhập để theo dõi.');
  if (followerUid === followingUid) throw new Error('Không thể tự theo dõi chính mình.');

  const followDocId = `${followerUid}_${followingUid}`;
  const ref = doc(db, FOLLOWS_COL, followDocId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return { following: false };
  }

  await setDoc(ref, {
    followerUid,
    followingUid,
    createdAt: new Date().toISOString(),
  });

  await createNotification({
    recipientUid: followingUid,
    actorUid: followerUid,
    actorName: followerName || 'Thành viên Signory',
    type: 'follow',
    message: `${followerName || 'Một gia đình'} đã bắt đầu theo dõi hành trình của bạn.`,
  });

  return { following: true };
}

// ─────────────────────────────────────────────────────────────
// SAFETY: BLOCK & REPORT
// ─────────────────────────────────────────────────────────────

export async function getBlockedUserIds(blockerUid) {
  if (!blockerUid) return [];
  try {
    const q = query(collection(db, BLOCKS_COL), where('blockerUid', '==', blockerUid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().blockedUid).filter(Boolean);
  } catch {
    return [];
  }
}

export async function blockCommunityUser({ blockerUid, blockedUid }) {
  if (!blockerUid) throw new Error('Vui lòng đăng nhập.');
  if (blockerUid === blockedUid) return { success: false };
  const docId = `${blockerUid}_${blockedUid}`;
  await setDoc(doc(db, BLOCKS_COL, docId), {
    blockerUid,
    blockedUid,
    createdAt: new Date().toISOString(),
  });
  return { success: true };
}

export async function unblockCommunityUser({ blockerUid, blockedUid }) {
  if (!blockerUid) return { success: false };
  await deleteDoc(doc(db, BLOCKS_COL, `${blockerUid}_${blockedUid}`));
  return { success: true };
}

export async function reportCommunityContent({ reporterUid, targetType, targetId, reason }) {
  if (!reporterUid) throw new Error('Vui lòng đăng nhập để báo cáo nội dung.');
  const reportId = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const record = sanitizeForFirestore({
    id: reportId,
    reportId,
    reporterUid,
    targetType,
    targetId,
    reason: String(reason || '').trim() || 'Nội dung không phù hợp',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  await setDoc(doc(db, REPORTS_COL, reportId), record);
  return record;
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

async function createNotification(notif) {
  try {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await setDoc(
      doc(db, NOTIFICATIONS_COL, id),
      sanitizeForFirestore({
        ...notif,
        id,
        read: false,
        createdAt: new Date().toISOString(),
      })
    );
  } catch {}
}

export async function getUserNotifications(uid) {
  if (!uid) return [];
  try {
    const q = query(collection(db, NOTIFICATIONS_COL), where('recipientUid', '==', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list.slice(0, 25);
  } catch {
    return [];
  }
}

export async function markNotificationsRead(uid) {
  if (!uid) return;
  try {
    const q = query(collection(db, NOTIFICATIONS_COL), where('recipientUid', '==', uid));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      if (!d.data().read) batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// ADMIN MODERATION & AUDIT LOGS
// ─────────────────────────────────────────────────────────────

export async function logAdminModeration({ adminUid, action, targetType, targetId, reason = '' }) {
  try {
    const logId = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await setDoc(
      doc(db, MOD_LOGS_COL, logId),
      sanitizeForFirestore({
        id: logId,
        logId,
        adminUid,
        action,
        targetType,
        targetId,
        reason,
        createdAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.warn('logAdminModeration error:', err.message);
  }
}

export async function togglePostVisibilityAdmin({ postId, hide, adminUid, reason = '' }) {
  if (!adminUid) throw new Error('Yêu cầu quyền Quản trị viên.');
  const ref = doc(db, POSTS_COL, postId);
  const newStatus = hide ? 'hidden' : 'active';
  await updateDoc(ref, {
    status: newStatus,
    moderatedAt: new Date().toISOString(),
    moderatedBy: adminUid,
  });

  await logAdminModeration({
    adminUid,
    action: hide ? 'hide_post' : 'restore_post',
    targetType: 'communityPost',
    targetId: postId,
    reason,
  });

  return { success: true, status: newStatus };
}

export async function getCommunityReportsAdmin() {
  try {
    const snap = await getDocs(collection(db, REPORTS_COL));
    const list = snap.docs.map((d) => ({ id: d.id, reportId: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch {
    return [];
  }
}

export async function resolveReportAdmin({ reportId, status = 'resolved', adminUid }) {
  await updateDoc(doc(db, REPORTS_COL, reportId), {
    status,
    resolvedBy: adminUid,
    resolvedAt: new Date().toISOString(),
  });
  await logAdminModeration({
    adminUid,
    action: `report_${status}`,
    targetType: 'communityReport',
    targetId: reportId,
  });
  return { success: true };
}
