import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Lock, 
  Unlock, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Search 
} from 'lucide-react';
import { getAllUsersAdmin, toggleUserLockAdmin } from '../../services/dbService';
import { useSound } from '../../context/SoundContext';

export const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { playClick, playCorrect } = useSound();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersAdmin();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleLock = async (user) => {
    playClick();
    const newLockState = !user.isLocked;
    await toggleUserLockAdmin(user.id, newLockState);
    playCorrect();
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isLocked: newLockState } : u));
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Quản Lý Người Dùng</h1>
          <p className="text-sm font-semibold text-slate-500">
            Theo dõi tiến độ học tập, điểm số và quản lý quyền truy cập tài khoản
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-xs outline-none focus:border-purple-500 bg-white"
          />
        </div>
      </div>

      {/* Child Privacy Compliance Note */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-medium flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
        <span>
          Tuân thủ nguyên tắc an toàn trẻ em: Hệ thống chỉ quản lý tài khoản theo email phụ huynh và tên hiển thị tự chọn, không lưu hình ảnh khuôn mặt hoặc thông tin cá nhân nhạy cảm của trẻ.
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Đang tải người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-bold text-slate-500 text-sm">Không tìm thấy người dùng nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((item) => (
              <div key={item.id} className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm border border-purple-200 shrink-0">
                    {item.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                        {item.displayName || 'Gia đình Signory'}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        item.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.role || 'user'}
                      </span>
                      {item.isLocked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600">
                          Đã khóa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span>{item.totalStars || 0} sao</span>
                  </div>

                  <div className="flex items-center gap-1 text-brand-600">
                    <Sparkles className="w-4 h-4" />
                    <span>{item.totalExp || 0} EXP</span>
                  </div>

                  <button
                    onClick={() => handleToggleLock(item)}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all ${
                      item.isLocked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {item.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{item.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersList;
