import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { 
  getLessons, 
  saveLessonAdmin, 
  deleteLessonAdmin 
} from '../../services/dbService';
import { useSound } from '../../context/SoundContext';

export const AdminLessonsList = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const navigate = useNavigate();
  const { playClick, playCorrect, playIncorrect } = useSound();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getLessons('admin');
      setLessons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (lesson) => {
    playClick();
    const updated = { ...lesson, isPublished: !lesson.isPublished };
    await saveLessonAdmin(updated);
    setLessons(prev => prev.map(l => l.id === lesson.id ? updated : l));
    setActionMsg(`Đã ${updated.isPublished ? 'xuất bản' : 'chuyển về bản nháp'} bài học!`);
    setTimeout(() => setActionMsg(null), 2500);
  };

  const handleToggleLock = async (lesson) => {
    playClick();
    const updated = { ...lesson, isLockedByDefault: !lesson.isLockedByDefault };
    await saveLessonAdmin(updated);
    setLessons(prev => prev.map(l => l.id === lesson.id ? updated : l));
    setActionMsg(`Đã thay đổi trạng thái khóa mặc định.`);
    setTimeout(() => setActionMsg(null), 2500);
  };

  const handleDuplicate = async (lesson) => {
    playClick();
    const newLesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      title: `${lesson.title} (Bản sao)`,
      isPublished: false,
      order: (lesson.order || 1) + 1,
      createdAt: new Date().toISOString()
    };
    await saveLessonAdmin(newLesson);
    playCorrect();
    setActionMsg(`Đã nhân bản bài học thành công!`);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    playClick();
    try {
      await deleteLessonAdmin(deleteTarget.id);
      playCorrect();
      setDeleteTarget(null);
      setActionMsg(`Đã xóa bài học vĩnh viễn.`);
      loadData();
    } catch (err) {
      playIncorrect();
      console.error(err);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    playClick();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;

    const newLessons = [...lessons];
    const current = newLessons[index];
    const target = newLessons[targetIdx];

    const tempOrder = current.order || index + 1;
    current.order = target.order || targetIdx + 1;
    target.order = tempOrder;

    newLessons[index] = target;
    newLessons[targetIdx] = current;

    setLessons(newLessons);
    await Promise.all([
      saveLessonAdmin(current),
      saveLessonAdmin(target)
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Quản Lý Bài Học</h1>
          <p className="text-sm font-semibold text-slate-500">
            Tạo mới, chỉnh sửa, sắp xếp thứ tự và quản lý trạng thái xuất bản
          </p>
        </div>

        <Link
          to="/admin/builder"
          onClick={playClick}
          className="px-4 py-2.5 rounded-2xl font-black text-white btn-3d btn-purple-3d flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm Bài Học Mới</span>
        </Link>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Lesson List Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Đang tải danh sách bài học...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="font-bold text-slate-500">Chưa có bài học nào được tạo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveOrder(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      title="Di chuyển lên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(idx, 1)}
                      disabled={idx === lessons.length - 1}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <img
                    src={lesson.thumbnail || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120'}
                    alt={lesson.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {lesson.topic || 'Chủ đề'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Chế độ: {lesson.mode === 'parents' ? 'Phụ huynh' : (lesson.mode === 'kids' ? 'Bé' : 'Tất cả')}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-base">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Publish Toggle Button */}
                  <button
                    onClick={() => handleTogglePublish(lesson)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                      lesson.isPublished
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lesson.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{lesson.isPublished ? 'Đang hiển thị' : 'Ẩn (Nháp)'}</span>
                  </button>

                  {/* Lock Default Toggle */}
                  <button
                    onClick={() => handleToggleLock(lesson)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      lesson.isLockedByDefault
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    title={lesson.isLockedByDefault ? 'Khóa mặc định (Cần hoàn thành bài trước)' : 'Mở mặc định'}
                  >
                    {lesson.isLockedByDefault ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={() => handleDuplicate(lesson)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
                    title="Nhân bản bài học"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit in Builder */}
                  <button
                    onClick={() => navigate(`/admin/builder?lessonId=${lesson.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa nội dung</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteTarget(lesson)}
                    className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 transition-all"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-red-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-800">Xác Nhận Xóa Bài Học?</h3>
              <p className="text-slate-600 text-sm font-semibold">
                Bạn có chắc chắn muốn xóa bài học <strong className="text-red-600">"{deleteTarget.title}"</strong> cùng toàn bộ các câu hỏi và nội dung bên trong? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl font-black text-white btn-3d btn-red-3d text-sm"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessonsList;
