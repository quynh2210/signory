/**
 * SIGNORY Cloudinary Media Service
 * - Signed direct upload (secret stays on server, XHR for real progress)
 * - Graceful fallback: unsigned preset if sign endpoint fails
 * - Delete via backend proxy
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'di7xar1oz';
const UNSIGNED_PRESET = 'signory_unsigned'; // create this in Cloudinary dashboard as fallback

/** Parse JSON safely; returns null on failure */
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Upload a file to Cloudinary with progress callback.
 * Strategy:
 *  1. Ask backend for a signed-upload token (keeps secret off client).
 *  2. Upload directly from browser → Cloudinary (fastest, real progress).
 *  3. If backend unreachable → try unsigned preset fallback.
 */
export const uploadMediaToCloudinary = async (file, onProgress = () => {}) => {
  // ── Step 1: Get a signed upload token from our backend ──────────────────
  let signData = null;
  try {
    const ctrl = new AbortController();
    const timerId = setTimeout(() => ctrl.abort(), 8000); // 8 s timeout

    const signRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folder: 'signory',
        resourceType: file.type.startsWith('video') ? 'video' : 'image',
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timerId);

    if (signRes.ok) {
      signData = await safeJson(signRes);
    } else {
      const errBody = await safeJson(signRes);
      console.warn('Sign endpoint error:', signRes.status, errBody);
    }
  } catch (e) {
    console.warn('Could not reach sign endpoint:', e.message);
  }

  // ── Step 2: Signed XHR upload with real progress ────────────────────────
  if (signData?.signature) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const isVideo = file.type.startsWith('video');
      const resourceType = isVideo ? 'video' : 'image';
      const url = `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`;

      xhr.open('POST', url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            onProgress(100);
            resolve({
              url: res.secure_url,
              publicId: res.public_id,
              format: res.format,
              resourceType: res.resource_type,
              bytes: res.bytes,
              duration: res.duration || null,
              width: res.width || null,
              height: res.height || null,
              originalFilename: file.name,
            });
          } catch {
            reject(new Error('Cloudinary trả về dữ liệu không hợp lệ.'));
          }
        } else {
          let errMsg = `Upload thất bại (${xhr.status})`;
          try {
            const errBody = JSON.parse(xhr.responseText);
            if (errBody?.error?.message) errMsg = errBody.error.message;
          } catch { /* ignore */ }
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => reject(new Error('Lỗi mạng khi upload lên Cloudinary.'));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder || 'signory');

      xhr.send(formData);
    });
  }

  // ── Step 3: Unsigned preset fallback (no backend needed) ────────────────
  console.warn('Using unsigned preset fallback for Cloudinary upload.');
  onProgress(10);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const isVideo = file.type.startsWith('video');
    const resourceType = isVideo ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          onProgress(100);
          resolve({
            url: res.secure_url,
            publicId: res.public_id,
            format: res.format,
            resourceType: res.resource_type,
            bytes: res.bytes,
            duration: res.duration || null,
            width: res.width || null,
            height: res.height || null,
            originalFilename: file.name,
          });
        } catch {
          reject(new Error('Cloudinary trả về dữ liệu không hợp lệ.'));
        }
      } else {
        let errMsg = `Upload thất bại (${xhr.status})`;
        try {
          const errBody = JSON.parse(xhr.responseText);
          // Provide helpful Vietnamese error
          if (xhr.status === 401 || (errBody?.error?.message || '').includes('preset')) {
            errMsg = 'Chưa thể tải lên Cloudinary. Vui lòng thêm biến môi trường CLOUDINARY_API_SECRET trên Vercel hoặc tạo upload preset unsigned "signory_unsigned" trên Cloudinary Dashboard.';
          } else if (errBody?.error?.message) {
            errMsg = errBody.error.message;
          }
        } catch { /* ignore */ }
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Lỗi mạng. Vui lòng kiểm tra kết nối internet.'));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UNSIGNED_PRESET);
    formData.append('folder', 'signory');

    xhr.send(formData);
  });
};

/**
 * Delete media from Cloudinary via backend proxy.
 */
export const deleteMediaFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const res = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, resourceType }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || `Delete failed (${res.status})`);
    return data;
  } catch (error) {
    console.error('Delete media error:', error);
    throw error;
  }
};
