import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles,
  Save
} from 'lucide-react';
import { getUserBadges, saveBadgeAdmin } from '../../services/dbService';
import { useSound } from '../../context/SoundContext';
import { BadgeIcon } from '../../components/common/BadgeIcon';

export const AdminBadgesList = () => {
  const [badges, setBadges] = useState([]);
  const [editingBadge, setEditingBadge] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);
  const { playClick, playCorrect } = useSound();

  const loadBadges = async () => {
    const { allBadges } = await getUserBadges(null);
    setBadges(allBadges);
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    if (!editingBadge) return;
    playClick();

    await saveBadgeAdmin(editingBadge);
    playCorrect();
    setSaveNotice('Đã lưu huy hiệu thành công!');
    setEditingBadge(null);
    loadBadges();
    setTimeout(() => setSaveNotice(null), 2500);
  };

  const handleCreateNew = () => {
    playClick();
    setEditingBadge({
      id: `badge-${Date.now()}`,
      name: 'Huy Hiệu Mới',
      description: 'Mô tả điều kiện nhận huy hiệu...',
      imageUrl: 'https://api.iconify.design/noto:star.svg',
      pointsBonus: 50,
      condition: 'Hoàn thành bài học...'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Quản Lý Phần Thưởng & Huy Hiệu</h1>
          <p className="text-sm font-semibold text-slate-500">
            Tạo và chỉnh sửa các danh hiệu ghi nhận thành tích cho phụ huynh và các bé
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-2xl font-black text-white btn-3d btn-purple-3d flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tạo Huy Hiệu Mới</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm space-y-3 flex flex-col justify-between hover:border-purple-200 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                <BadgeIcon badge={badge} className="w-full h-full" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-base">{badge.name}</h4>
                <p className="text-xs text-slate-500 font-medium line-clamp-2">{badge.description}</p>
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md mt-1">
                  {badge.condition}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
              <span className="text-emerald-600 font-extrabold">+{badge.pointsBonus || 30} EXP</span>
              <button
                onClick={() => setEditingBadge(badge)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 font-bold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Badge Modal */}
      {editingBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBadge}
            className="bg-white rounded-[32px] p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-slate-100 space-y-4"
          >
            <h3 className="text-xl font-black text-slate-800">Chỉnh Sửa Huy Hiệu</h3>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">Tên huy hiệu</label>
              <input
                type="text"
                required
                value={editingBadge.name}
                onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">Mô tả</label>
              <textarea
                rows={2}
                value={editingBadge.description}
                onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-medium text-xs outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">URL Hình ảnh / Icon</label>
              <input
                type="text"
                value={editingBadge.imageUrl}
                onChange={(e) => setEditingBadge({ ...editingBadge, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-mono text-xs outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Điểm thưởng EXP</label>
                <input
                  type="number"
                  value={editingBadge.pointsBonus}
                  onChange={(e) => setEditingBadge({ ...editingBadge, pointsBonus: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Điều kiện nhận</label>
                <input
                  type="text"
                  value={editingBadge.condition}
                  onChange={(e) => setEditingBadge({ ...editingBadge, condition: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-medium text-xs outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingBadge(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl font-black text-white btn-3d btn-purple-3d text-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Huy Hiệu</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminBadgesList;
