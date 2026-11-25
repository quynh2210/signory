import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from './firebase';
import { sanitizeForFirestore } from './dbService';
import { safeDeleteUserUploadedMedia } from './mediaSafetyService';
import { logAdminModeration } from './communityService';

const KINDNESS_COL = 'kindnessCards';

export const CARD_TEMPLATES = [
  {
    id: 'pastel',
    name: 'Pastel Hồng',
    badge: 'Nhẹ nhàng',
    lightClass: 'bg-gradient-to-br from-rose-100 via-amber-50 to-teal-50 border-rose-300 text-slate-800',
    darkClass: 'dark:from-rose-950/95 dark:via-slate-800 dark:to-teal-950/95 dark:border-rose-600/70 dark:text-slate-100',
    pinColor: '#f43f5e',
    accent: '🌸',
  },
  {
    id: 'flower',
    name: 'Vườn Hoa',
    badge: 'Vườn hoa',
    lightClass: 'bg-gradient-to-br from-pink-100 to-emerald-50 border-pink-300 text-slate-800',
    darkClass: 'dark:from-pink-950/90 dark:to-emerald-950/90 dark:border-pink-600/70 dark:text-slate-100',
    pinColor: '#ec4899',
    accent: '🌺',
  },
  {
    id: 'cloud',
    name: 'Mây Xanh',
    badge: 'Mây trắng',
    lightClass: 'bg-gradient-to-br from-sky-100 to-indigo-50 border-sky-300 text-slate-800',
    darkClass: 'dark:from-sky-950/95 dark:to-indigo-950/95 dark:border-sky-500/70 dark:text-slate-100',
    pinColor: '#0ea5e9',
    accent: '☁️',
  },
  {
    id: 'letter',
    name: 'Giấy Nhớ Vàng',
    badge: 'Lá thư',
    lightClass: 'bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-300 text-amber-950',
    darkClass: 'dark:from-amber-950/95 dark:to-slate-800 dark:border-amber-500/70 dark:text-amber-50',
    pinColor: '#f59e0b',
    accent: '✉️',
  },
  {
    id: 'memory',
    name: 'Kỷ Niệm Tím',
    badge: 'Kỷ niệm',
    lightClass: 'bg-gradient-to-br from-purple-100 to-fuchsia-50 border-purple-300 text-slate-800',
    darkClass: 'dark:from-purple-950/95 dark:to-slate-800 dark:border-purple-500/70 dark:text-slate-100',
    pinColor: '#a855f7',
    accent: '📸',
  },
  {
    id: 'starry',
    name: 'Đêm Sao',
    badge: 'Đêm sao',
    lightClass: 'bg-gradient-to-br from-indigo-900 to-purple-900 border-amber-300 text-amber-50',
    darkClass: 'dark:from-indigo-950 dark:to-slate-900 dark:border-amber-400/70 dark:text-amber-50',
    pinColor: '#fbbf24',
    accent: '✨',
  },
  {
    id: 'minimal',
    name: 'Lá Xanh Sage',
    badge: 'Tối giản',
    lightClass: 'bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-300 text-emerald-950',
    darkClass: 'dark:from-emerald-950/95 dark:to-slate-800 dark:border-emerald-500/70 dark:text-emerald-50',
    pinColor: '#10b981',
    accent: '🌿',
  },
];

export const CARD_SHAPES = [
  { id: 'note', label: 'Giấy nhớ', className: 'rounded-2xl rounded-br-[2px]' },
  { id: 'rounded', label: 'Bo tròn', className: 'rounded-3xl' },
  { id: 'arch', label: 'Vòm cửa', className: 'rounded-t-[48px] rounded-b-2xl' },
  { id: 'ticket', label: 'Thẻ tem', className: 'rounded-lg border-dashed' },
  { id: 'pill', label: 'Đám mây', className: 'rounded-[32px] rounded-tl-md' },
];

export const KINDNESS_TOPICS = [
  'Động viên cha mẹ',
  'Lời nhắn cho bé',
  'Niềm vui mỗi ngày',
  'Biết ơn & Yêu thương',
];

const INITIAL_WARM_CARDS = [
  {
    id: 'kindness-seed-1',
    cardId: 'kindness-seed-1',
    uid: 'system-seed',
    displayName: 'Mẹ Bé Bông',
    topic: 'Động viên cha mẹ',
    theme: 'letter',
    shape: 'note',
    posX: 22,
    posY: 28,
    rotation: -5,
    message:
      'Hôm nay con lần đầu làm ký hiệu "Yêu mẹ" trước khi đi ngủ. Mọi vất vả suốt mấy tháng qua bỗng tan biến hết. Các bố mẹ đừng nản nhé, từng bước nhỏ mỗi ngày đều rất giá trị!',
    status: 'active',
    createdAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 'kindness-seed-2',
    cardId: 'kindness-seed-2',
    uid: 'system-seed',
    displayName: 'Gia Đình SIGNORY',
    topic: 'Biết ơn & Yêu thương',
    theme: 'flower',
    shape: 'arch',
    posX: 52,
    posY: 24,
    rotation: 3,
    message:
      'Mỗi cử chỉ tay là một nhịp cầu đưa trái tim đến gần nhau hơn. Chúc các gia đình luôn thật nhiều kiên nhẫn, nụ cười và bình an trên hành trình cùng con.',
    status: 'active',
    createdAt: '2026-11-21T10:30:00.000Z',
  },
  {
    id: 'kindness-seed-3',
    cardId: 'kindness-seed-3',
    uid: 'system-seed',
    displayName: 'Bố Ken & Tít',
    topic: 'Niềm vui mỗi ngày',
    theme: 'starry',
    shape: 'rounded',
    posX: 77,
    posY: 36,
    rotation: -4,
    message:
      'Chỉ cần 3 phút mỗi tối đọc Tấm Cám bằng ký hiệu cùng con, cả nhà mình cười vang suốt buổi. Cảm ơn cộng đồng đã luôn tiếp thêm động lực!',
    status: 'active',
    createdAt: '2026-11-22T18:15:00.000Z',
  },
  {
    id: 'kindness-seed-4',
    cardId: 'kindness-seed-4',
    uid: 'system-seed',
    displayName: 'Cô Giáo Hạnh',
    topic: 'Lời nhắn cho bé',
    theme: 'cloud',
    shape: 'pill',
    posX: 35,
    posY: 64,
    rotation: 5,
    message:
      'Các bé ơi, mỗi ký hiệu mới các con học hôm nay giống như một ngôi sao nhỏ lấp lánh. Cứ tự tin vẫy tay và mỉm cười thật tươi nhé!',
    status: 'active',
    createdAt: '2026-11-23T08:40:00.000Z',
  },
  {
    id: 'kindness-seed-5',
    cardId: 'kindness-seed-5',
    uid: 'system-seed',
    displayName: 'Chị Hai & Bé Na',
    topic: 'Biết ơn & Yêu thương',
    theme: 'minimal',
    shape: 'ticket',
    posX: 66,
    posY: 68,
    rotation: -6,
    message:
      'Cảm ơn SIGNORY đã giúp hai chị em mình hiểu nhau nhiều hơn qua từng trang truyện cổ tích!',
    status: 'active',
    createdAt: '2026-11-24T14:20:00.000Z',
  },
];

/**
 * Provides safe, natural fallback coordinates & tilt for older cards without posX/posY
 */
export function resolveCardWallLayout(card, index = 0) {
  if (typeof card.posX === 'number' && typeof card.posY === 'number') {
    return {
      posX: Math.min(90, Math.max(10, card.posX)),
      posY: Math.min(86, Math.max(12, card.posY)),
      rotation: typeof card.rotation === 'number' ? card.rotation : ((index % 5) - 2) * 3,
      shape: card.shape || CARD_SHAPES[index % CARD_SHAPES.length].id,
    };
  }
  const cols = 4;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const posX = 16 + col * 22 + ((index * 7) % 9) - 4;
  const posY = 20 + ((row * 26) % 62) + ((index * 5) % 8);
  const rotation = [-6, 4, -3, 6, -5, 2][index % 6];
  return {
    posX: Math.min(88, Math.max(12, posX)),
    posY: Math.min(84, Math.max(14, posY)),
    rotation,
    shape: card.shape || CARD_SHAPES[index % CARD_SHAPES.length].id,
  };
}

export async function getKindnessCards({ includeHidden = false } = {}) {
  try {
    const snap = await getDocs(collection(db, KINDNESS_COL));
    if (snap.empty) {
      return INITIAL_WARM_CARDS;
    }
    const list = snap.docs
      .map((d) => ({ id: d.id, cardId: d.id, ...d.data() }))
      .filter((c) => includeHidden || c.status !== 'hidden');
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (err) {
    console.warn('getKindnessCards fallback:', err.message);
    return INITIAL_WARM_CARDS;
  }
}

export async function createKindnessCard({
  uid,
  displayName,
  message,
  topic = KINDNESS_TOPICS[0],
  theme = 'pastel',
  shape = 'note',
  posX = null,
  posY = null,
  rotation = null,
  mediaUrl = '',
  mediaPublicId = '',
  mediaResourceType = 'image',
}) {
  if (!uid) throw new Error('Vui lòng đăng nhập để gửi thiệp lên Bức Tường Yêu Thương.');
  const trimmedMsg = String(message || '').trim();
  const trimmedName = String(displayName || '').trim() || 'Người bạn SIGNORY';
  if (!trimmedMsg) throw new Error('Vui lòng viết lời nhắn yêu thương.');

  const finalPosX =
    typeof posX === 'number' ? Math.min(90, Math.max(10, posX)) : 18 + Math.round(Math.random() * 64);
  const finalPosY =
    typeof posY === 'number' ? Math.min(86, Math.max(12, posY)) : 18 + Math.round(Math.random() * 62);
  const finalRotation =
    typeof rotation === 'number' ? rotation : Math.round((Math.random() - 0.5) * 14);

  const cardId = `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const record = sanitizeForFirestore({
    id: cardId,
    cardId,
    uid,
    displayName: trimmedName,
    message: trimmedMsg,
    topic,
    theme,
    shape,
    posX: finalPosX,
    posY: finalPosY,
    rotation: finalRotation,
    mediaUrl: mediaUrl || null,
    mediaPublicId: mediaPublicId || null,
    mediaResourceType: mediaResourceType || 'image',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  await setDoc(doc(db, KINDNESS_COL, cardId), {
    ...record,
    serverCreatedAt: serverTimestamp(),
  });

  return record;
}

export async function deleteKindnessCard({ cardId, actorUid, isAdmin = false, reason = '' }) {
  if (!actorUid) throw new Error('Vui lòng đăng nhập.');
  const ref = doc(db, KINDNESS_COL, cardId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { success: true };

  const data = snap.data();
  const isOwner = data.uid === actorUid;
  if (!isOwner && !isAdmin) {
    throw new Error('Bạn chỉ có thể xóa tấm thiệp của chính mình.');
  }

  if (data.mediaPublicId) {
    await safeDeleteUserUploadedMedia({
      url: data.mediaUrl,
      publicId: data.mediaPublicId,
      resourceType: data.mediaResourceType || 'image',
    });
  }

  await deleteDoc(ref);

  if (isAdmin && !isOwner) {
    await logAdminModeration({
      adminUid: actorUid,
      action: 'delete_kindness_card',
      targetType: 'kindnessCard',
      targetId: cardId,
      reason: reason || 'Xóa thiệp không phù hợp',
    });
  }

  return { success: true };
}

export async function toggleKindnessCardVisibilityAdmin({ cardId, hide, adminUid, reason = '' }) {
  if (!adminUid) throw new Error('Yêu cầu quyền Quản trị viên.');
  const ref = doc(db, KINDNESS_COL, cardId);
  const newStatus = hide ? 'hidden' : 'active';
  await updateDoc(ref, {
    status: newStatus,
    moderatedBy: adminUid,
    moderatedAt: new Date().toISOString(),
  });

  await logAdminModeration({
    adminUid,
    action: hide ? 'hide_kindness_card' : 'restore_kindness_card',
    targetType: 'kindnessCard',
    targetId: cardId,
    reason,
  });

  return { success: true, status: newStatus };
}
