import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FilePlus, 
  Image as ImageIcon, 
  Users, 
  Award, 
  Settings, 
  ArrowLeft, 
  ShieldAlert,
  Sparkles,
  Home,
  Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';

export const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick } = useSound();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Strict Admin Verification
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border-2 border-red-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-slate-600 text-sm font-semibold">
            Khu vực này chỉ dành riêng cho Quản trị viên (ADMIN). Vui lòng đăng nhập bằng tài khoản Admin hoặc nhập Secret Key trong trang Cá nhân.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 py-3 rounded-xl font-black text-white btn-3d btn-purple-3d text-sm"
            >
              Cấp quyền Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Tổng Quan', icon: LayoutDashboard, exact: true },
    { path: '/admin/lessons', label: 'Quản Lý Bài Học', icon: BookOpen },
    { path: '/admin/builder', label: 'Trình Tạo Bài Học', icon: FilePlus },
    { path: '/admin/media', label: 'Quản Lý Media', icon: ImageIcon },
    { path: '/admin/videos', label: 'Video QR', icon: Video },
    { path: '/admin/users', label: 'Người Dùng', icon: Users },
    { path: '/admin/badges', label: 'Phần Thưởng & Huy Hiệu', icon: Award },
    { path: '/admin/settings', label: 'Cài Đặt Hệ Thống & Audio', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 md:p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                A
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base leading-tight">Admin SIGNORY</h3>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Hệ thống quản trị</span>
              </div>
            </div>
          </div>

          {/* Prominent Back to Home Button in Sidebar */}
          <Link
            to="/"
            onClick={playClick}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm flex items-center gap-2.5 border border-slate-200 transition-all shadow-sm"
          >
            <Home className="w-4 h-4 text-brand-600" />
            <span>Về Trang Chủ Website</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);

              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={playClick}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-black text-sm transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400 space-y-1">
          <p>Cloudinary: Đã kết nối</p>
          <p>Firestore: Trực tuyến</p>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        {/* Top Quick Bar with Return to Home */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 md:hidden">
          <Link
            to="/"
            onClick={playClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black shadow-sm"
          >
            <Home className="w-4 h-4 text-brand-500" />
            <span>Về Trang Chủ Website</span>
          </Link>
          <span className="text-xs font-black text-purple-700">Admin Signory</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
