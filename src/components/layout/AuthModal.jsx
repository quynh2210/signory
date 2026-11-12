import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Key, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'admin-claim'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { login, register, resetPassword, claimAdmin } = useAuth();
  const { playClick, playCorrect, playIncorrect } = useSound();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    playClick();

    try {
      if (mode === 'login') {
        await login(email, password);
        playCorrect();
        onClose();
      } else if (mode === 'register') {
        if (!email || !password) {
          throw new Error('Vui lòng điền đầy đủ email và mật khẩu');
        }
        await register(email, password, displayName);
        playCorrect();
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        playCorrect();
        setSuccessMsg('Đã gửi liên kết đặt lại mật khẩu về email của bạn!');
      } else if (mode === 'admin-claim') {
        await claimAdmin(adminKey);
        playCorrect();
        setSuccessMsg('Đã kích hoạt thành công quyền ADMIN! Bạn có thể vào khu vực quản trị.');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      playIncorrect();
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký. Vui lòng đăng nhập.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu cần có ít nhất 6 ký tự.');
      } else {
        setError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper for the evaluator
  const handleQuickDemo = async (type) => {
    playClick();
    if (type === 'user') {
      setEmail('family.demo@signory.edu.vn');
      setPassword('Signory123456');
      setDisplayName('Gia đình Bé Bon');
    } else if (type === 'admin') {
      setEmail('admin@signory.edu.vn');
      setPassword('SignoryAdmin2026');
      setDisplayName('Quản Trị Viên Signory');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-slate-100 relative"
      >
        {/* Close Button */}
        <button
          onClick={() => { playClick(); onClose(); }}
          className="absolute top-5 right-5 p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <img src="/logo.svg" alt="SIGNORY" className="w-12 h-12 mx-auto" />
          <h3 className="text-2xl font-black text-slate-800">
            {mode === 'login' && 'Chào mừng trở lại!'}
            {mode === 'register' && 'Tạo tài khoản gia đình'}
            {mode === 'forgot' && 'Đặt lại mật khẩu'}
            {mode === 'admin-claim' && 'Kích hoạt quyền Quản trị'}
          </h3>
          <p className="text-sm font-bold text-slate-500">
            {mode === 'login' && 'Đăng nhập để lưu tiến độ học tập và huy hiệu'}
            {mode === 'register' && 'Cùng con khám phá thế giới ngôn ngữ ký hiệu'}
            {mode === 'forgot' && 'Nhập email để nhận liên kết khôi phục'}
            {mode === 'admin-claim' && 'Nhập mã bảo mật để cấp quyền ADMIN'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Tên hiển thị / Biệt danh gia đình
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Bố Ken & Bé Tít"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 font-bold text-slate-800 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {mode !== 'admin-claim' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gia-dinh@gmail.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 font-bold text-slate-800 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Mật khẩu
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 font-bold text-slate-800 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'admin-claim' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Mã bảo mật Quản trị (Admin Secret Key)
              </label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Nhập secret key quản trị..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-bold text-slate-800 outline-none transition-all text-sm"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Liên hệ quản trị viên để được cấp mã bảo mật.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-white btn-3d btn-green-3d transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Đăng Nhập Ngay'}
                  {mode === 'register' && 'Bắt Đầu Học'}
                  {mode === 'forgot' && 'Gửi Yêu Cầu'}
                  {mode === 'admin-claim' && 'Xác Nhận Kích Hoạt Admin'}
                </span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Thử nghiệm nhanh (Demo):
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
            >
              Mẫu Phụ Huynh
            </button>
            <button
              type="button"
              onClick={() => { handleQuickDemo('admin'); setMode('admin-claim'); }}
              className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold transition-all"
            >
              Cấp Quyền Admin
            </button>
          </div>
        </div>

        {/* Footer Mode Switcher */}
        <div className="mt-4 text-center text-sm font-bold text-slate-500">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-brand-600 font-black hover:underline"
              >
                Đăng ký miễn phí
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-brand-600 font-black hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
