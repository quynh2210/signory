import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Baby, 
  Sparkles, 
  Star, 
  Play, 
  Lock, 
  Check, 
  Clock, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getLessons, getUserProgress } from '../services/dbService';
import ModeTransitionOverlay from '../components/common/ModeTransitionOverlay';
import LearningMapBackdrop from '../components/common/LearningMapBackdrop';

export const KidsModePage = () => {
  const [lessons, setLessons] = useState([]);
  const [userProgressMap, setUserProgressMap] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  const { user, userProfile } = useAuth();
  const { playClick } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedLessons = await getLessons('kids');
        setLessons(fetchedLessons);

        if (user) {
          const progress = await getUserProgress(user.uid);
          setUserProgressMap(progress);
        }
      } catch (err) {
        console.error('Error loading kids map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Determine if a lesson is unlocked for Kids mode
  const isLessonUnlocked = (lesson, index) => {
    if (index === 0) return true; // First lesson is always unlocked by default
    if (!lesson.isLockedByDefault) return true;

    const prevLesson = lessons[index - 1];
    if (!prevLesson) return true;
    const prevProgress = userProgressMap[prevLesson.id];
    return prevProgress?.status === 'completed';
  };

  const handleNodeClick = (lesson, unlocked) => {
    playClick();
    if (!unlocked) return;
    setSelectedLesson(lesson);
  };

  const handleStartLesson = (lessonId) => {
    playClick();
    try {
      sessionStorage.setItem('signory_last_learning_tab', '/kids');
    } catch {}
    navigate(`/lesson/${lessonId}?mode=kids&returnTo=${encodeURIComponent('/kids')}`);
  };

  return (
    <div className="min-h-screen relative overflow-x-clip pb-20 px-4">
      {showIntro && (
        <ModeTransitionOverlay mode="kids" onComplete={() => setShowIntro(false)} />
      )}
      <LearningMapBackdrop variant="kids" />
      <div className="relative z-10 max-w-4xl mx-auto py-8 space-y-8">
        {/* Top Kids Banner */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border-4 border-purple-200 dark:border-purple-800 shadow-duo-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-duo-purple text-white flex items-center justify-center shrink-0 shadow-duo animate-bounce-slow">
              <Baby className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-duo-purpleDark dark:text-purple-300">Bản Đồ Ký Hiệu Của Bé</h2>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                  Chế độ Bé yêu
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-bold mt-1">
                Bé cùng xem ký hiệu, đoán hình và học đánh vần chữ cái thật vui nhé!
              </p>
            </div>
          </div>

          {/* User Stats Mini pill */}
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/40 border-2 border-purple-200 dark:border-purple-700 px-4 py-2.5 rounded-2xl">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-300">Ngôi Sao</span>
              <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 font-black text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                <span>{userProfile?.totalStars || 0}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-purple-200 dark:bg-purple-700" />
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-300">Điểm Thưởng</span>
              <div className="flex items-center justify-center gap-1 text-brand-600 dark:text-brand-400 font-black text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{userProfile?.totalExp || 0} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Duolingo Style Learning Map for Kids */}
        <div className="relative py-6">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 border-4 border-duo-purple border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-duo-purpleDark">Đang tải bản đồ bài học cho bé...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-14 relative">
              {lessons.map((lesson, index) => {
                const unlocked = isLessonUnlocked(lesson, index);
                const progress = userProgressMap[lesson.id];
                const isCompleted = progress?.status === 'completed';
                const stars = progress?.stars || 0;

                // Zig-zag offset
                const offsets = ['translate-x-0', '-translate-x-12 sm:-translate-x-20', 'translate-x-12 sm:translate-x-20'];
                const currentOffset = offsets[index % offsets.length];

                return (
                  <div 
                    key={lesson.id} 
                    className={`flex flex-col items-center relative ${currentOffset} transition-all duration-300`}
                  >
                    {/* Lesson Circle Node */}
                    <motion.button
                      whileHover={{ scale: unlocked ? 1.1 : 1 }}
                      whileTap={{ scale: unlocked ? 0.95 : 1 }}
                      onClick={() => handleNodeClick(lesson, unlocked)}
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center relative transition-all shadow-duo-lg border-4 ${
                        isCompleted
                          ? 'bg-gradient-to-b from-yellow-300 to-amber-400 border-yellow-200 text-yellow-950'
                          : unlocked
                          ? 'bg-gradient-to-b from-purple-400 to-duo-purple border-purple-200 dark:border-purple-600 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {/* Node Icon */}
                      {isCompleted ? (
                        <Check className="w-12 h-12 stroke-[3]" />
                      ) : unlocked ? (
                        <Play className="w-10 h-10 fill-current ml-1" />
                      ) : (
                        <Lock className="w-8 h-8" />
                      )}

                      {/* Stars Badge underneath node */}
                      {isCompleted && (
                        <div className="absolute -bottom-3 flex items-center justify-center gap-0.5 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border-2 border-yellow-300 shadow-sm">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= stars ? 'fill-yellow-400 text-yellow-500' : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>

                    {/* Title & Topic label */}
                    <div className="mt-3 text-center max-w-[220px]">
                      <span className="text-[11px] font-black uppercase text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 rounded-full">
                        {lesson.topic || `Chặng ${index + 1}`}
                      </span>
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-base mt-1">
                        {lesson.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Lesson Detail Drawer / Modal for Kids */}
        {selectedLesson && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[36px] p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-purple-200 dark:border-purple-700 space-y-6 text-center"
            >
              {/* Thumbnail */}
              {selectedLesson.thumbnail && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-purple-100 dark:border-purple-900/40 relative">
                  <img 
                    src={selectedLesson.thumbnail} 
                    alt={selectedLesson.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-duo-purple text-white font-black text-xs px-3 py-1 rounded-xl shadow-sm">
                    {selectedLesson.topic}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-duo-purpleDark dark:text-purple-300">
                  {selectedLesson.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-bold leading-relaxed">
                  {selectedLesson.description}
                </p>
              </div>

              {/* Signs List */}
              {selectedLesson.signsList && (
                <div className="bg-purple-50 dark:bg-purple-900/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-700 space-y-2">
                  <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-300">
                    Ký hiệu bé sẽ khám phá:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedLesson.signsList.map((sign, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-purple-300 dark:border-purple-600 text-purple-900 dark:text-purple-200 font-black text-sm rounded-xl shadow-sm"
                      >
                        ✨ {sign}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all text-sm"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleStartLesson(selectedLesson.id)}
                  className="flex-1 py-3.5 rounded-2xl font-black text-white btn-3d btn-purple-3d transition-all flex items-center justify-center gap-2 text-base"
                >
                  <span>Cùng Bé Học Ngay</span>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsModePage;
