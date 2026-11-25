import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Star,
  Award,
  User,
  ShieldCheck,
  Sparkles,
  LogOut,
  Baby,
  Users,
  Moon,
  Sun,
  BookOpen,
  Heart,
  MessageCircle,
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

  const navItems = [
    {
      to: '/stories',
      label: 'Câu Chuyện',
      icon: <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />,
      activeColor: 'text-amber-600 dark:text-amber-300',
      isKids: false,
    },
    {
      to: '/parents',
      label: 'Phụ Huynh',
      icon: <Users className="w-4 h-4 text-brand-500 shrink-0" />,
      activeColor: 'text-brand-600 dark:text-brand-300',
      isKids: false,
    },
    {
      to: '/kids',
      label: 'Chế Độ Bé',
      icon: <Baby className="w-4 h-4 shrink-0" />,
      activeColor: 'text-white',
      isKids: true,
    },
    {
      to: '/leaderboard',
      label: 'Xếp Hạng',
      icon: <Award className="w-4 h-4 text-yellow-500 shrink-0" />,
      activeColor: 'text-yellow-600 dark:text-yellow-300',
      isKids: false,
    },
    {
      to: '/circle',
      label: 'Cộng Đồng',
      icon: <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
      activeColor: 'text-emerald-600 dark:text-emerald-300',
      isKids: false,
    },
    {
      to: '/kindness',
      label: 'Yêu Thương',
      icon: <Heart className="w-4 h-4 text-rose-500 shrink-0" />,
      activeColor: 'text-rose-600 dark:text-rose-300',
      isKids: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/92 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 h-[60px] flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" onClick={playClick} className="flex items-center gap-2 group shrink-0">
          <motion.img
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.4 }}
            src="/logo.svg"
            alt="SIGNORY"
            className="w-8 h-8 shrink-0"
          />
          <span className="text-lg lg:text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">
            SIGN<span className="text-amber-500 dark:text-yellow-400">ORY</span>
          </span>
        </Link>

        {/* Desktop Nav — wide horizontal bar, single-line text, sliding active pill */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={playClick}
                className="relative px-3.5 py-1.5 rounded-xl font-black text-[13px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className={`absolute inset-0 rounded-xl shadow-sm ${
                      item.isKids
                        ? 'bg-gradient-to-r from-duo-purple to-pink-500'
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 ${
                    active
                      ? item.activeColor
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Compact tablet nav (md only) */}
        <nav className="hidden md:flex lg:hidden items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={playClick}
                className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? item.isKids
                      ? 'bg-duo-purple text-white shadow-sm'
                      : `bg-white dark:bg-slate-700 ${item.activeColor} shadow-sm`
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-slate-600 bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {/* Sound */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>

          {/* Stats (visible on xl so mid-screens stay spacious) */}
          {user && (
            <div className="hidden xl:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                <span>{userProfile?.totalStars || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{userProfile?.totalExp || 0} XP</span>
              </div>
            </div>
          )}

          {/* Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={playClick}
              className="px-2.5 py-1.5 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 text-purple-700 dark:text-purple-300 rounded-xl font-black text-xs flex items-center gap-1 border border-purple-300 dark:border-purple-700 transition-all whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Quản Trị</span>
            </Link>
          )}

          {/* User / Login */}
          {user ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                to="/profile"
                onClick={playClick}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all hover:border-slate-300 whitespace-nowrap"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-[11px] shrink-0">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[88px] truncate">
                  {userProfile?.displayName || 'Tài khoản'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playClick();
                onOpenAuth();
              }}
              className="px-3.5 py-2 rounded-xl font-black text-white btn-3d btn-green-3d text-xs sm:text-sm whitespace-nowrap shrink-0"
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
          { to: '/circle', icon: <MessageCircle className="w-5 h-5" />, label: 'Cộng Đồng', color: 'text-emerald-600' },
          { to: '/kindness', icon: <Heart className="w-5 h-5" />, label: 'Yêu Thương', color: 'text-rose-600' },
          { to: '/leaderboard', icon: <Award className="w-5 h-5" />, label: 'Xếp Hạng', color: 'text-yellow-600' },
        ].map(({ to, icon, label, color }) => (
          <Link
            key={to}
            to={to}
            onClick={playClick}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-1.5 rounded-xl whitespace-nowrap ${
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
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-1.5 rounded-xl whitespace-nowrap ${
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
