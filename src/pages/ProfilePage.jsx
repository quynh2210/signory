import React, { useState, useEffect } from 'react';
import { 
  User, 
  Star, 
  Sparkles, 
  Award, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Key, 
  Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getUserBadges } from '../services/dbService';
import { BadgeIcon } from '../components/common/BadgeIcon';

export const ProfilePage = () => {
  const { user, userProfile, isAdmin, updateUserProfileData, claimAdmin } = useAuth();
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [badges, setBadges] = useState([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(userProfile?.dailyGoal || 30);
  const [adminSecretInput, setAdminSecretInput] = useState('');
  const [adminMsg, setAdminMsg] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    const fetchBadgeData = async () => {
      if (user) {
        const { allBadges, earnedCount } = await getUserBadges(user.uid);
        setBadges(allBadges);
        setEarnedCount(earnedCount);
      }
    };
    fetchBadgeData();
  }, [user]);

  const handleSaveGoal = async () => {
    playClick();
    try {
      await updateUserProfileData({ dailyGoal: Number(dailyGoal) });
      playCorrect();
      setSaveMsg('Đã cập nhật mục tiêu học tập hàng ngày!');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e) {
      playIncorrect();
    }
  };

  const handleClaimAdmin = async (e) => {
    e.preventDefault();
    playClick();
    try {
      await claimAdmin(adminSecretInput);
      playCorrect();
      setAdminMsg({ type: 'success', text: 'Chúc mừng! Bạn đã trở thành ADMIN thành công!' });
      setAdminSecretInput('');
    } catch (err) {
      playIncorrect();
      setAdminMsg({ type: 'error', text: err.message || 'Mã bảo mật không đúng!' });
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <User className="w-16 h-16 mx-auto text-slate-300" />
        <h3 className="text-2xl font-black text-slate-800">Bạn chưa đăng nhập</h3>
        <p className="text-slate-500 font-bold">Vui lòng đăng nhập để xem thông tin tài khoản và huy hiệu của bạn.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-white font-black text-4xl flex items-center justify-center shadow-duo border-4 border-brand-200">
          {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              {userProfile?.displayName || 'Gia đình Signory'}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              isAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600'
            }`}>
              {isAdmin ? 'Quản Trị Viên (ADMIN)' : 'Thành Viên (USER)'}
            </span>
          </div>

          <p className="text-slate-500 text-sm font-semibold">{user.email}</p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-yellow-600 font-black text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
              <span>{userProfile?.totalStars || 0} Ngôi sao</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-600 font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{userProfile?.totalExp || 0} EXP</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-600 font-black text-sm">
              <Award className="w-4 h-4" />
              <span>{earnedCount} Huy hiệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Showcase Section */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border-2 border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">Bộ Sưu Tập Huy Hiệu</h3>
            <p className="text-slate-500 text-sm font-bold">
              Đã mở khóa {earnedCount} / {badges.length} huy hiệu vinh dự
            </p>
          </div>
          <Award className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                badge.isEarned
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-55'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shrink-0 transition-all ${
                badge.isEarned ? '' : 'grayscale opacity-50'
              }`}>
                <BadgeIcon badge={badge} className="w-full h-full" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-slate-800 text-sm">{badge.name}</h4>
                  {badge.isEarned && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[3]" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{badge.description}</p>
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md mt-1">
                  {badge.condition}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Goal & Preferences Settings */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border-2 border-slate-100 shadow-sm space-y-4">
        <h3 className="text-xl font-black text-slate-800">Cài Đặt Mục Tiêu Mỗi Ngày</h3>
        <p className="text-sm text-slate-500 font-semibold">
          Duy trì thói quen học 3 phút mỗi ngày cùng cuốn sách truyện tranh ký hiệu.
        </p>

        {saveMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
            {saveMsg}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {[20, 30, 50, 100].map((goalVal) => (
            <button
              key={goalVal}
              onClick={() => setDailyGoal(goalVal)}
              className={`px-5 py-3 rounded-2xl font-black text-sm border-2 transition-all ${
                Number(dailyGoal) === goalVal
                  ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm ring-2 ring-brand-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {goalVal} EXP / ngày
            </button>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveGoal}
            className="px-6 py-2.5 rounded-xl font-bold text-white btn-3d btn-green-3d text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cài đặt</span>
          </button>
        </div>
      </div>

      {/* Admin bootstrap / promotion section */}
      {!isAdmin && (
        <div className="bg-purple-50 rounded-[32px] p-6 md:p-8 border-2 border-purple-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-purple-800">
            <Key className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-black">Kích Hoạt Quyền Quản Trị Viên (ADMIN)</h3>
          </div>
          <p className="text-sm font-semibold text-purple-700 leading-relaxed">
            Hệ thống SIGNORY phân quyền an toàn, không cho phép đăng ký trực tiếp quyền ADMIN. Nhập mã bảo mật để nâng cấp tài khoản của bạn thành Quản trị viên:
          </p>

          {adminMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${
              adminMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {adminMsg.text}
            </div>
          )}

          <form onSubmit={handleClaimAdmin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              placeholder="Nhập mã bảo mật quản trị viên"
              value={adminSecretInput}
              onChange={(e) => setAdminSecretInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-purple-200 font-bold text-sm bg-white outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-black text-white btn-3d btn-purple-3d text-sm whitespace-nowrap"
            >
              Kích Hoạt Admin
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
