import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Star, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getLeaderboard } from '../services/dbService';

export const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { playClick } = useSound();

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const board = await getLeaderboard();
        setUsers(board);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-3xl p-6 md:p-8 text-yellow-950 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-black">
            <Trophy className="w-4 h-4" />
            <span>Bảng Vinh Danh SIGNORY</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black">Gia Đình Chăm Chỉ</h2>
          <p className="font-bold text-sm md:text-base opacity-90 max-w-md">
            Cùng nhau tích lũy điểm kinh nghiệm (EXP) và nuôi dưỡng tình yêu ngôn ngữ ký hiệu mỗi ngày!
          </p>
        </div>

        {/* Daily Goal Reminder Card */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-yellow-200 dark:border-yellow-600/40 text-slate-800 dark:text-slate-100 text-center min-w-[200px]">
          <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-sm mb-1">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>Mục Tiêu Hôm Nay</span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {userProfile?.totalExp || 0} / {userProfile?.dailyGoal || 30} XP
          </p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {(userProfile?.totalExp || 0) >= (userProfile?.dailyGoal || 30) ? '🎉 Đã hoàn thành mục tiêu!' : 'Học thêm 1 bài để đạt mục tiêu!'}
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">Bảng Xếp Hạng Toàn Hệ Thống</h3>
          <span className="text-xs font-bold text-slate-400">Cập nhật theo thời gian thực</span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Đang tải bảng xếp hạng...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((item, index) => {
              const rank = index + 1;
              const isCurrentUser = user && item.id === user.uid;

              return (
                <div
                  key={item.id}
                  className={`p-4 md:px-6 flex items-center justify-between gap-4 transition-colors ${
                    isCurrentUser ? 'bg-amber-50/70 dark:bg-amber-950/40 border-l-4 border-amber-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {/* Rank & User */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 flex items-center justify-center">
                      {rank === 1 ? (
                        <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-950 font-black flex items-center justify-center shadow-duo text-sm">
                          🥇
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 font-black flex items-center justify-center shadow-duo text-sm">
                          🥈
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black flex items-center justify-center shadow-duo text-sm">
                          🥉
                        </div>
                      ) : (
                        <span className="font-black text-slate-400 text-base">{rank}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-black flex items-center justify-center text-sm border border-brand-200 dark:border-brand-700">
                        {item.displayName?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                            {item.displayName}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-500 text-white">
                              Bạn
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          Đã hoàn thành {item.completedCount || 0} bài học
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars & EXP */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:flex items-center gap-1 text-yellow-600 font-black text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                      <span>{item.totalStars || 0}</span>
                    </div>

                    <div className="min-w-[90px] text-right">
                      <span className="font-black text-brand-600 text-base md:text-lg">
                        {item.totalExp || 0}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1">EXP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
