import {
  db,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from './firebase';
import { sanitizeForFirestore } from './dbService';

const STORY_SENTENCES_COL = 'storySentences';
const SIGN_VIDEOS_COL = 'signVideos';

const DEFAULT_SAMPLE_VIDEO =
  'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4';

/**
 * Built-in initial sentences for Tấm Cám (additive only — never alters stories/chapters/lessons)
 */
const DEFAULT_TAM_CAM_SENTENCES = [
  {
    id: 'sentence-tc-1',
    sentenceId: 'sentence-tc-1',
    storyId: 'story-tam-cam',
    order: 1,
    sentenceText: 'Tấm sống hiền lành cùng dì ghẻ và Cám trong một ngôi nhà nhỏ.',
    signIds: ['sign-tam', 'sign-nha', 'sign-gia-dinh'],
    signVideos: [
      {
        signId: 'sign-tam',
        signName: 'Tấm (Nhân vật)',
        videoUrl: DEFAULT_SAMPLE_VIDEO,
        description: 'Ký hiệu giới thiệu nhân vật Tấm với nét mặt dịu dàng.',
        order: 1,
      },
      {
        signId: 'sign-nha',
        signName: 'Ngôi nhà',
        videoUrl: DEFAULT_SAMPLE_VIDEO,
        description: 'Hai bàn tay chụm đầu ngón tay tạo hình mái nhà trước ngực.',
        order: 2,
      },
    ],
  },
  {
    id: 'sentence-tc-2',
    sentenceId: 'sentence-tc-2',
    storyId: 'story-tam-cam',
    order: 2,
    sentenceText: 'Mỗi ngày, Tấm chăm chỉ ăn cơm sớm rồi đi làm việc nhà.',
    signIds: ['sign-an', 'sign-lam'],
    signVideos: [
      {
        signId: 'sign-an',
        signName: 'Ăn cơm',
        videoUrl: DEFAULT_SAMPLE_VIDEO,
        description: 'Chụm các đầu ngón tay đưa nhẹ về phía miệng như động tác ăn.',
        order: 1,
      },
    ],
  },
  {
    id: 'sentence-tc-3',
    sentenceId: 'sentence-tc-3',
    storyId: 'story-tam-cam',
    order: 3,
    sentenceText: 'Ông Bụt hiện lên mỉm cười, an ủi và giúp đỡ Tấm lúc buồn.',
    signIds: ['sign-buon', 'sign-vui', 'sign-yeu-thuong'],
    signVideos: [
      {
        signId: 'sign-vui',
        signName: 'Vui vẻ / Mỉm cười',
        videoUrl: DEFAULT_SAMPLE_VIDEO,
        description: 'Hai bàn tay đưa nhẹ từ ngực lên trên kèm biểu cảm khuôn mặt tươi tắn.',
        order: 1,
      },
    ],
  },
  {
    id: 'sentence-tc-4',
    sentenceId: 'sentence-tc-4',
    storyId: 'story-tam-cam',
    order: 4,
    sentenceText: 'Cuối cùng, sự lương thiện và tình yêu thương mang lại hạnh phúc.',
    signIds: ['sign-yeu-thuong', 'sign-hanh-phuc'],
    signVideos: [
      {
        signId: 'sign-yeu-thuong',
        signName: 'Yêu thương',
        videoUrl: DEFAULT_SAMPLE_VIDEO,
        description: 'Đặt hai bàn tay bắt chéo nhẹ lên trước trái tim.',
        order: 1,
      },
    ],
  },
];

/**
 * Fetch sentences for a story, ordered cleanly in memory (no composite index needed)
 */
export async function getStorySentences(storyId) {
  if (!storyId) return [];
  try {
    const q = query(collection(db, STORY_SENTENCES_COL), where('storyId', '==', storyId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, sentenceId: d.id, ...d.data() }));
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    if (list.length === 0 && storyId === 'story-tam-cam') {
      return DEFAULT_TAM_CAM_SENTENCES;
    }
    return list;
  } catch (err) {
    console.warn('getStorySentences fallback:', err.message);
    if (storyId === 'story-tam-cam') return DEFAULT_TAM_CAM_SENTENCES;
    return [];
  }
}

export async function saveStorySentenceAdmin(sentence) {
  const sentenceId = sentence.id || sentence.sentenceId || `sentence-${Date.now()}`;
  const signVideos = Array.isArray(sentence.signVideos) ? sentence.signVideos : [];
  const signIds = signVideos.map((v) => v.signId).filter(Boolean);

  const payload = sanitizeForFirestore({
    ...sentence,
    id: sentenceId,
    sentenceId,
    order: Number(sentence.order) || 1,
    signVideos,
    signIds,
    updatedAt: new Date().toISOString(),
    createdAt: sentence.createdAt || new Date().toISOString(),
  });

  await setDoc(doc(db, STORY_SENTENCES_COL, sentenceId), payload, { merge: true });

  // Also index individual sign videos into `signVideos` collection for future reuse
  for (let i = 0; i < signVideos.length; i++) {
    const sv = signVideos[i];
    if (!sv?.signId) continue;
    await setDoc(
      doc(db, SIGN_VIDEOS_COL, sv.signId),
      sanitizeForFirestore({
        ...sv,
        storyId: sentence.storyId,
        sentenceId,
        order: Number(sv.order) || i + 1,
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    ).catch(() => {});
  }

  return { success: true, id: sentenceId };
}

export async function deleteStorySentenceAdmin(sentenceId) {
  await deleteDoc(doc(db, STORY_SENTENCES_COL, sentenceId));
  return { success: true };
}

export async function seedTamCamMirrorSentences() {
  for (const s of DEFAULT_TAM_CAM_SENTENCES) {
    await saveStorySentenceAdmin(s);
  }
  return { success: true };
}

/**
 * Extensible motion/pose detection adapter hook for future AI sign recognition models.
 * Currently intentionally operates in visual self-comparison mode (no automated pass/fail grading).
 */
export function createMotionAnalysisAdapter() {
  return {
    mode: 'visual-comparison',
    isModelLoaded: false,
    async analyzeFrame(_videoElement, _targetSignId) {
      return {
        status: 'unverified-model',
        confidence: null,
        message: 'Chế độ tự quan sát và đối chiếu trực tiếp qua gương.',
      };
    },
  };
}
