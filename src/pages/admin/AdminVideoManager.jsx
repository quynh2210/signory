import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Upload, Trash2, Link, QrCode, Video, Copy,
  CheckCheck, ExternalLink, Eye, AlertCircle, Loader, Search, Film
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from '../../services/cloudinaryService';
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, updateDoc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useSound } from '../../context/SoundContext';

const COLLECTION = 'signory_videos';

const VideoCard = ({ video, onDelete, onCopy, copiedId }) => {
  const [showQR, setShowQR] = useState(false);
  const watchUrl = `${window.location.origin}/watch/${video.id}`;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden hover:border-blue-200 transition-all">
      {/* Thumbnail */}
      <div className="relative bg-slate-900 aspect-video">
        <video
          src={video.url}
          className="w-full h-full object-contain"
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Film className="w-7 h-7 text-white" />
          </div>
        </div>
        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1">{video.title || video.originalFilename || 'Video'}</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {video.bytes ? `${(video.bytes / 1024 / 1024).toFixed(1)} MB` : ''} · {video.format?.toUpperCase() || ''}
          </p>
        </div>

        {/* Watch URL */}
        <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
          <Link className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-xs font-mono text-slate-600 truncate flex-1">{watchUrl}</span>
          <button
            onClick={() => onCopy(video.id, watchUrl)}
            className="shrink-0 p-1 rounded-lg hover:bg-blue-100 transition-colors"
            title="Sao chép link"
          >
            {copiedId === video.id
              ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              : <Copy className="w-3.5 h-3.5 text-blue-500" />
            }
          </button>
        </div>

        {/* QR Code Toggle */}
        {showQR && (
          <div className="flex flex-col items-center gap-2 py-2">
            <QRCodeSVG
              value={watchUrl}
              size={140}
              bgColor="#ffffff"
              fgColor="#1e293b"
              level="M"
              includeMargin
            />
            <p className="text-[10px] text-slate-400 font-bold text-center">QR code cho video này</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowQR(v => !v)}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 transition-all ${
              showQR ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            {showQR ? 'Ẩn QR' : 'Xem QR'}
          </button>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-slate-200 text-slate-600 hover:border-emerald-300 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Xem thử
          </a>
          <button
            onClick={() => onDelete(video)}
            className="p-2 rounded-xl border-2 border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 transition-all"
            title="Xóa video"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminVideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);
  const { playClick, playCorrect, playIncorrect } = useSound();

  const loadVideos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      // Firestore offline fallback
      console.warn('Could not load videos from Firestore:', e.message);
      const local = JSON.parse(localStorage.getItem('signory_videos') || '[]');
      setVideos(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(); }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Chỉ chấp nhận file video (mp4, mov, webm...)');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('File quá lớn. Giới hạn 500 MB mỗi video.');
      return;
    }
    setPendingFile(file);
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    setError(null);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    playClick();
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadMediaToCloudinary(pendingFile, (pct) => {
        setUploadProgress(pct);
      });

      // Save to Firestore
      const videoData = {
        title: uploadTitle || pendingFile.name.replace(/\.[^.]+$/, ''),
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        resourceType: 'video',
        bytes: result.bytes,
        duration: result.duration,
        width: result.width,
        height: result.height,
        originalFilename: pendingFile.name,
        createdAt: new Date().toISOString(),
      };

      let docId;
      try {
        const docRef = await addDoc(collection(db, COLLECTION), videoData);
        docId = docRef.id;
      } catch (fsErr) {
        console.warn('Firestore save failed, using localStorage:', fsErr.message);
        docId = `vid_${Date.now()}`;
        const local = JSON.parse(localStorage.getItem('signory_videos') || '[]');
        local.unshift({ id: docId, ...videoData });
        localStorage.setItem('signory_videos', JSON.stringify(local));
      }

      playCorrect();
      setSuccess('Video đã được upload thành công!');
      setPendingFile(null);
      setUploadTitle('');
      setShowUpload(false);
      setTimeout(() => setSuccess(null), 4000);
      loadVideos();
    } catch (e) {
      playIncorrect();
      setError(e.message || 'Upload thất bại. Hãy thử lại.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (video) => {
    if (!confirm(`Xóa video "${video.title || video.originalFilename}"? Thao tác này không thể hoàn tác.`)) return;
    playClick();
    try {
      await deleteMediaFromCloudinary(video.publicId, 'video');
    } catch (e) {
      console.warn('Cloudinary delete error:', e.message);
    }
    try {
      await deleteDoc(doc(db, COLLECTION, video.id));
    } catch {
      const local = JSON.parse(localStorage.getItem('signory_videos') || '[]');
      localStorage.setItem('signory_videos', JSON.stringify(local.filter(v => v.id !== video.id)));
    }
    setVideos(prev => prev.filter(v => v.id !== video.id));
    setSuccess('Đã xóa video.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const filtered = videos.filter(v =>
    (v.title || v.originalFilename || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Quản Lý Video QR</h1>
          <p className="text-sm font-semibold text-slate-500">
            Upload video, tạo link riêng và QR code để chia sẻ từng video độc lập
          </p>
        </div>
        <button
          onClick={() => { playClick(); setShowUpload(v => !v); }}
          className="px-4 py-2.5 rounded-2xl font-black text-white btn-3d btn-blue-3d flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Upload Video Mới</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-2xl flex items-center gap-2">
          <CheckCheck className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Upload Panel */}
      {showUpload && (
        <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200 space-y-4">
          <h3 className="text-base font-black text-blue-800 flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload Video Mới
          </h3>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => !pendingFile && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-blue-500 bg-blue-100' :
              pendingFile ? 'border-emerald-400 bg-emerald-50' :
              'border-blue-300 hover:border-blue-500 hover:bg-blue-100/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            {pendingFile ? (
              <div className="space-y-1">
                <Film className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="font-black text-emerald-700 text-sm">{pendingFile.name}</p>
                <p className="text-xs text-emerald-600">{(pendingFile.size / 1024 / 1024).toFixed(1)} MB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setPendingFile(null); setUploadTitle(''); }}
                  className="text-xs text-red-500 font-bold underline mt-1"
                >Chọn file khác</button>
              </div>
            ) : (
              <div className="space-y-2">
                <Video className="w-10 h-10 mx-auto text-blue-400" />
                <p className="font-bold text-blue-700 text-sm">Kéo thả video vào đây hoặc bấm để chọn</p>
                <p className="text-xs text-blue-500">MP4, MOV, WEBM · Tối đa 500 MB</p>
              </div>
            )}
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-black uppercase text-blue-700 mb-1">Tiêu đề video</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Nhập tên video để dễ nhận biết..."
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-blue-200 font-bold text-sm bg-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-blue-700">
                <span>Đang upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-3">
            <button
              onClick={() => { setShowUpload(false); setPendingFile(null); setUploadTitle(''); }}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={!pendingFile || uploading}
              className="flex-1 py-3 rounded-2xl font-black text-white btn-3d btn-blue-3d text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? <><Loader className="w-4 h-4 animate-spin" /> Đang upload...</>
                : <><Upload className="w-4 h-4" /> Upload Video</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Backend tip */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex gap-3 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-800 font-semibold">
          <strong>Lưu ý:</strong> Backend server phải đang chạy để upload hoạt động.
          Chạy lệnh <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">npm run server</code> trong terminal nếu upload thất bại.
        </div>
      </div>

      {/* Search */}
      {videos.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm video..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 font-semibold text-sm bg-white outline-none focus:border-blue-400"
          />
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Film className="w-16 h-16 mx-auto text-slate-200" />
          <p className="font-black text-slate-400 text-lg">
            {videos.length === 0 ? 'Chưa có video nào' : 'Không tìm thấy video'}
          </p>
          <p className="text-sm text-slate-400">
            {videos.length === 0 ? 'Upload video đầu tiên để tạo link QR.' : 'Thử tìm với từ khóa khác.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={handleDelete}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVideoManager;
