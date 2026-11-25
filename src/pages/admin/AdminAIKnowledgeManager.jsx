import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Save,
  Trash2,
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  Upload,
  Video,
  Search,
} from 'lucide-react';
import {
  getAllAIKnowledgeAdmin,
  saveAIKnowledgeAdmin,
  deleteAIKnowledgeAdmin,
} from '../../services/aiService';
import { getLessons } from '../../services/dbService';
import { uploadMediaToCloudinary } from '../../services/cloudinaryService';
import { useSound } from '../../context/SoundContext';

const CATEGORY_LABELS = {
  sign: 'Ký hiệu cụ thể',
  story_sign: 'Ký hiệu trong truyện',
  parent_guide: 'Hướng dẫn phụ huynh',
  concept: 'Khái niệm ngôn ngữ ký hiệu',
};

export const AdminAIKnowledgeManager = () => {
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [items, setItems] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [kList, lList] = await Promise.all([
      getAllAIKnowledgeAdmin(),
      getLessons('admin'),
    ]);
    setItems(kList);
    setLessons(lList);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAllAIKnowledgeAdmin(), getLessons('admin')]).then(([kList, lList]) => {
      if (!active) return;
      setItems(kList);
      setLessons(lList);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleNew = () => {
    playClick();
    setForm({
      id: `know-${Date.now()}`,
      title: '',
      category: 'sign',
      keywords: '',
      content: '',
      videoUrl: '',
      relatedLessonIds: [],
      verified: true,
    });
  };

  const handleEdit = (item) => {
    playClick();
    setForm({
      ...item,
      keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords || '',
      relatedLessonIds: item.relatedLessonIds || [],
    });
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await uploadMediaToCloudinary(file);
      playCorrect();
      setForm((prev) => ({ ...prev, videoUrl: res.url }));
    } catch (err) {
      playIncorrect();
      alert('Lỗi upload video: ' + err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    if (!form?.title.trim() || !form?.content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung kiến thức đã xác minh.');
      return;
    }
    setSaving(true);
    try {
      await saveAIKnowledgeAdmin(form);
      playCorrect();
      setForm(null);
      await loadData();
    } catch (err) {
      playIncorrect();
      alert('Lỗi lưu kiến thức AI: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mục kiến thức AI này?')) return;
    playClick();
    await deleteAIKnowledgeAdmin(id);
    await loadData();
  };

  const toggleLessonLink = (lessonId) => {
    setForm((prev) => {
      const current = prev.relatedLessonIds || [];
      const exists = current.includes(lessonId);
      return {
        ...prev,
        relatedLessonIds: exists
          ? current.filter((id) => id !== lessonId)
          : [...current, lessonId],
      };
    });
  };

  const filtered = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q) ||
      (item.keywords || []).join(' ').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-600" />
            <span>Kho Kiến Thức Xác Minh – SIGNORY AI</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            SIGNORY AI ưu tiên tra cứu dữ liệu xác minh từ đây và từ các bài học trước khi trả lời người dùng.
          </p>
        </div>

        <button
          onClick={handleNew}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Kiến Thức Mới</span>
        </button>
      </div>

      {/* Form */}
      {form && (
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-slate-800">
              {items.some((i) => i.id === form.id) ? 'Chỉnh Sửa Kiến Thức' : 'Thêm Kiến Thức Xác Minh'}
            </h2>
            <button
              onClick={() => setForm(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">Tiêu đề / Tên ký hiệu *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="VD: Ký hiệu Ăn (trong gia đình)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">Phân loại</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-600 mb-1">
                Từ khóa tìm kiếm (phân cách bằng dấu phẩy)
              </label>
              <input
                value={form.keywords}
                onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
                placeholder="VD: ăn, bữa ăn, cơm, ký hiệu ăn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-600 mb-1">
                Nội dung mô tả chuẩn xác / Hướng dẫn phụ huynh *
              </label>
              <textarea
                rows={4}
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Mô tả chi tiết động tác hoặc hướng dẫn đã được kiểm chứng..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-600 mb-1">
                Video minh họa (URL hoặc tải lên)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={form.videoUrl || ''}
                  onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <label className="px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                  {uploadingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Video</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploadingVideo}
                    onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {lessons.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-600 mb-1.5">
                  Liên kết bài học (để AI gợi ý nút "Mở bài học")
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  {lessons.map((l) => {
                    const selected = form.relatedLessonIds?.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => toggleLessonLink(l.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {l.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="aiVerified"
                checked={form.verified}
                onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))}
              />
              <label htmlFor="aiVerified" className="text-sm font-black text-emerald-700 cursor-pointer">
                Đã xác minh chuyên môn (Cho phép SIGNORY AI trích dẫn)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setForm(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu Kiến Thức</span>
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên ký hiệu hoặc từ khóa..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
          <Bot className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-black text-slate-700">Chưa có tài liệu kiến thức riêng cho AI</p>
          <p className="text-xs font-semibold text-slate-400">
            SIGNORY AI vẫn tự động đọc dữ liệu từ các Bài học, Câu chuyện và Video QR hiện có. Bạn có thể bổ sung thêm kiến thức chuyên sâu tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mb-1">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <h3 className="font-black text-slate-800 text-base">{item.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-600 font-medium line-clamp-3 whitespace-pre-line">
                {item.content}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {item.verified !== false && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác minh
                  </span>
                )}
                {item.videoUrl && (
                  <span className="inline-flex items-center gap-1 text-purple-600 font-bold">
                    <Video className="w-3.5 h-3.5" /> Có video minh họa
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAIKnowledgeManager;
