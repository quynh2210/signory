import { db, collection, getDocs } from './firebase';
import { deleteMediaFromCloudinary } from './cloudinaryService';

/**
 * Safely deletes newly uploaded community/kindness media from Cloudinary
 * ONLY after confirming the URL/publicId is NOT referenced in any lesson, block, story, video, or mirror sentence.
 */
export async function safeDeleteUserUploadedMedia({ url, publicId, resourceType = 'image' }) {
  if (!publicId || publicId.startsWith('samples/')) {
    return { skipped: true, reason: 'sample-or-empty' };
  }

  try {
    const protectedCollections = ['lessons', 'lessonBlocks', 'stories', 'signory_videos', 'storySentences', 'aiKnowledge'];
    const snaps = await Promise.all(
      protectedCollections.map((col) => getDocs(collection(db, col)).catch(() => null))
    );

    const targetUrl = String(url || '');
    for (const snap of snaps) {
      if (!snap) continue;
      for (const d of snap.docs) {
        const serialized = JSON.stringify(d.data() || {});
        if ((targetUrl && serialized.includes(targetUrl)) || serialized.includes(publicId)) {
          console.warn(`Protected media detected (${publicId}), skipping Cloudinary delete.`);
          return { skipped: true, reason: 'referenced-by-learning-content' };
        }
      }
    }

    await deleteMediaFromCloudinary(publicId, resourceType);
    return { deleted: true };
  } catch (err) {
    console.warn('safeDeleteUserUploadedMedia note:', err.message);
    return { skipped: true, error: err.message };
  }
}
