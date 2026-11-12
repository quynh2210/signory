import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from '../../services/cloudinaryService';
import { useSound } from '../../context/SoundContext';

export const AdminMediaManager = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaList, setMediaList] = useState(() => {
    const saved = localStorage.getItem('signory_admin_media_library');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        url: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        publicId: 'samples/cld-sample-video',
        resourceType: 'video',
        fileName: 'cld-sample-video.mp4',
        uploadedAt: new Date().toISOString()
      },
      {
        url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
        publicId: 'samples/sign-home-demo',
        resourceType: 'image',
        fileName: 'ky-hieu-nha.jpg',
        uploadedAt: new Date().toISOString()
      },
      {
        url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
        publicId: 'samples/sign-eat-demo',
        resourceType: 'image',
        fileName: 'ky-hieu-an.jpg',
        uploadedAt: new Date().toISOString()
      }
    ];
  });

  const [copiedId, setCopiedId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const { playClick, playCorrect, playIncorrect } = useSound();

  useEffect(() => {
    localStorage.setItem('signory_admin_media_library', JSON.stringify(mediaList));
  }, [mediaList]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    playClick();

    try {
      const result = await uploadMediaToCloudinary(file, (percent) => {
        setUploadProgress(percent);
      });

      playCorrect();
      const newMedia = {
        url: result.url,
        publicId: result.publicId,
        resourceType: result.resourceType || (file.type.startsWith('video') ? 'video' : 'image'),
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      };

      setMediaList(prev => [newMedia, ...prev]);
      setActionNotice({ type: 'success', text: `Upload file "${file.name}" lên Cloudinary thành công!` });
    } catch (err) {
      playIncorrect();
      console.error(err);
      setActionNotice({ type: 'error', text: `Upload thất bại: ${err.message}` });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${item.fileName || item.publicId}" khỏi Cloudinary?`)) return;
    playClick();

    try {
      if (item.publicId && !item.publicId.startsWith('samples/')) {
        await deleteMediaFromCloudinary(item.publicId, item.resourceType);
      }
      playCorrect();
      setMediaList(prev => prev.filter(m => m.publicId !== item.publicId));
      setActionNotice({ type: 'success', text: 'Đã xóa file khỏi Cloudinary và thư viện!' });
    } catch (err) {
      playIncorrect();
      setActionNotice({ type: 'error', text: `Lỗi khi xóa media: ${err.message}` });
    }
  };

  const handleCopyUrl = (item) => {
    playClick();
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">Quản Lý Media (Cloudinary)</h1>
        <p className="text-sm font-semibold text-slate-500">
          Upload hình ảnh minh họa và video ký hiệu. Khi xóa, file sẽ được dọn dẹp an toàn trên Cloudinary.
        </p>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${
          actionNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionNotice.type === 'success' ? <Sparkles className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-purple-300 shadow-sm text-center space-y-4 hover:border-purple-500 transition-all">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-800">
            Tải lên Hình ảnh hoặc Video Ngôn ngữ Ký hiệu
          </h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
            Hỗ trợ hình ảnh (.png, .jpg, .webp) và video (.mp4, .webm). Tự động tạo URL bảo mật qua Cloudinary.
          </p>
        </div>

        {isUploading ? (
          <div className="max-w-md mx-auto space-y-2 py-4">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Đang tải lên Cloudinary...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-white btn-3d btn-purple-3d text-sm cursor-pointer shadow-md">
            <UploadCloud className="w-5 h-5" />
            <span>Chọn tệp tải lên</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-800">
          Thư Viện Media Đã Tải Lên ({mediaList.length} tệp)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaList.map((item) => {
            const isVideo = item.resourceType === 'video';

            return (
              <div
                key={item.publicId}
                className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50 flex flex-col justify-between group hover:border-purple-200 transition-all"
              >
                {/* Media Preview */}
                <div className="w-full aspect-video bg-black/5 flex items-center justify-center overflow-hidden relative">
                  {isVideo ? (
                    <video
                      src={item.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase">
                    {item.resourceType}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="p-3.5 space-y-2 bg-white border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 truncate" title={item.fileName || item.publicId}>
                    {item.fileName || item.publicId}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                    >
                      {copiedId === item.publicId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span className="text-emerald-600">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Chép URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteMedia(item)}
                      className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                      title="Xóa khỏi Cloudinary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminMediaManager;
