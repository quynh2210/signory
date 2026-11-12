import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Volume2, 
  VolumeX, 
  Flame, 
  Star, 
  Award, 
  User, 
  ShieldCheck, 
  Sparkles,
  LogOut,
  Compass,
  Baby,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';

export const Navbar = ({ onOpenAuth }) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { soundEnabled, toggleSound, playClick } = useSound();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    playClick();
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-100 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={playClick}
          className="flex items-center gap-2.5 group"
        >
          <img 
            src="/logo.svg" 
            alt="SIGNORY Logo" 
            className="w-10 h-10 group-hover:scale-105 transition-transform"
          />
          <span className="text-2xl font-black tracking-tight text-slate-800">
            SIGN<span className="text-brand-500">ORY</span>
          </span>
        </Link>

        {/* Center Mode Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <Link
            to="/parents"
            onClick={playClick}
            className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
              location.pathname.startsWith('/parents')
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-brand-500" />
            <span>Phụ Huynh</span>
          </Link>

          <Link
            to="/kids"
            onClick={playClick}
            className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
              location.pathname.startsWith('/kids')
                ? 'bg-duo-purple text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>Chế Độ Bé</span>
          </Link>

          <Link
            to="/leaderboard"
            onClick={playClick}
            className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
              location.pathname === '/leaderboard'
                ? 'bg-white text-yellow-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-yellow-500" />
            <span>Xếp Hạng</span>
          </Link>
        </nav>

        {/* Right Area: Stats, Audio, Auth, Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-2xl border-2 transition-all ${
              soundEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* User Stats if logged in */}
          {user && (
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-sm font-black">
              {/* Stars */}
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                <span>{userProfile?.totalStars || 0}</span>
              </div>
              {/* EXP */}
              <div className="flex items-center gap-1 text-brand-600">
                <Sparkles className="w-4 h-4" />
                <span>{userProfile?.totalExp || 0} XP</span>
              </div>
            </div>
          )}

          {/* Admin shortcut if admin */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={playClick}
              className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 border border-purple-300 transition-all shadow-sm"
              title="Quản trị nội dung"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Quản Trị</span>
            </Link>
          )}

          {/* Auth Button or User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                onClick={playClick}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-extrabold text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-xs">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate">
                  {userProfile?.displayName || 'Tài khoản'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl border-2 border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { playClick(); onOpenAuth(); }}
              className="px-5 py-2.5 rounded-2xl font-black text-white btn-3d btn-green-3d text-sm transition-all"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar at bottom */}
      <div className="md:hidden flex items-center justify-around bg-white border-t border-slate-200 py-2 px-1">
        <Link
          to="/parents"
          onClick={playClick}
          className={`flex flex-col items-center gap-1 text-xs font-bold py-1 px-3 rounded-xl ${
            location.pathname.startsWith('/parents') ? 'text-brand-600 font-black' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Phụ Huynh</span>
        </Link>
        <Link
          to="/kids"
          onClick={playClick}
          className={`flex flex-col items-center gap-1 text-xs font-bold py-1 px-3 rounded-xl ${
            location.pathname.startsWith('/kids') ? 'text-duo-purple font-black' : 'text-slate-500'
          }`}
        >
          <Baby className="w-5 h-5" />
          <span>Bé</span>
        </Link>
        <Link
          to="/leaderboard"
          onClick={playClick}
          className={`flex flex-col items-center gap-1 text-xs font-bold py-1 px-3 rounded-xl ${
            location.pathname === '/leaderboard' ? 'text-yellow-600 font-black' : 'text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Xếp Hạng</span>
        </Link>
        {user && (
          <Link
            to="/profile"
            onClick={playClick}
            className={`flex flex-col items-center gap-1 text-xs font-bold py-1 px-3 rounded-xl ${
              location.pathname === '/profile' ? 'text-brand-600 font-black' : 'text-slate-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Cá Nhân</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
