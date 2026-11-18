import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Volume2, VolumeX, Star, Award, User, ShieldCheck,
  Sparkles, LogOut, Baby, Users, Moon, Sun, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ onOpenAuth }) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { soundEnabled, toggleSound, playClick } = useSound();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    playClick();
    await logout();
    navigate('/');
  };

  const navLink = (to, label, icon, activeColor = 'text-brand-600') => {
    const active = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        onClick={playClick}
        className={`px-3 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
          active
            ? `bg-white dark:bg-slate-700 ${activeColor} shadow-sm border border-slate-200 dark:border-slate-500`
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/97 backdrop-blur-md border-b-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">

        {/* Brand */}
        <Link to="/" onClick={playClick} className="flex items-center gap-2.5 group shrink-0">
          <img src="/logo.svg" alt="SIGNORY" className="w-9 h-9 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            SIGN<span className="text-brand-500">ORY</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-600">
          {navLink('/stories', 'Câu Chuyện', <BookOpen className="w-4 h-4 text-amber-500" />, 'text-amber-600')}
          {navLink('/parents', 'Phụ Huynh', <Users className="w-4 h-4 text-brand-500" />, 'text-brand-600')}
          <Link
            to="/kids"
            onClick={playClick}
            className={`px-3 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
              location.pathname.startsWith('/kids')
                ? 'bg-duo-purple text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>Chế Độ Bé</span>
          </Link>
          {navLink('/leaderboard', 'Xếp Hạng', <Award className="w-4 h-4 text-yellow-500" />, 'text-yellow-600')}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border-2 transition-all ${
              isDark
                ? 'border-slate-600 bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
            title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-2xl border-2 transition-all ${
              soundEnabled
                ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stats */}
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-2xl text-sm font-black">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                <span>{userProfile?.totalStars || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                <Sparkles className="w-4 h-4" />
                <span>{userProfile?.totalExp || 0} XP</span>
              </div>
            </div>
          )}

          {/* Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={playClick}
              className="px-3 py-2 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 text-purple-700 dark:text-purple-300 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 border border-purple-300 dark:border-purple-700 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Quản Trị</span>
            </Link>
          )}

          {/* User / Login */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/profile"
                onClick={playClick}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-sm transition-all hover:border-slate-300"
              >
                <div className="w-7 h-7 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate text-sm">
                  {userProfile?.displayName || 'Tài khoản'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { playClick(); onOpenAuth(); }}
              className="px-4 py-2.5 rounded-2xl font-black text-white btn-3d btn-green-3d text-sm"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-1.5 px-1">
        {[
          { to: '/stories', icon: <BookOpen className="w-5 h-5" />, label: 'Truyện', color: 'text-amber-600' },
          { to: '/parents', icon: <Users className="w-5 h-5" />, label: 'Phụ Huynh', color: 'text-brand-600' },
          { to: '/kids', icon: <Baby className="w-5 h-5" />, label: 'Bé', color: 'text-purple-600' },
          { to: '/leaderboard', icon: <Award className="w-5 h-5" />, label: 'Xếp Hạng', color: 'text-yellow-600' },
        ].map(({ to, icon, label, color }) => (
          <Link
            key={to}
            to={to}
            onClick={playClick}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl ${
              location.pathname.startsWith(to) ? `${color} font-black` : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
        {user && (
          <Link
            to="/profile"
            onClick={playClick}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl ${
              location.pathname === '/profile' ? 'text-brand-600 font-black' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Tôi</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
