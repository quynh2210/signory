import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Lock, Unlock, Star, Sparkles, ArrowLeft, Loader2, Layers, CheckCircle2, Camera } from 'lucide-react';
import {
  getStories,
  getChapters,
  getLessonsByChapter,
  getUserProgress,
  seedTamCamStory
} from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import SignMirrorView from '../components/mirror/SignMirrorView';
import LearningMapBackdrop from '../components/common/LearningMapBackdrop';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80';

export const StoryMapPage = () => {
  const { storyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const activeStoryTab = searchParams.get('tab') === 'mirror' ? 'mirror' : 'lessons';

  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [lessonsByChapter, setLessonsByChapter] = useState({});
  const [userProgressMap, setUserProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(null);

  // Load progress for current user or guest
  const loadProgress = async () => {
    const p = await getUserProgress(user?.uid || 'guest');
    setUserProgressMap(p || {});
  };

  useEffect(() => {
    loadProgress();
    const handleUpdate = () => loadProgress();
    window.addEventListener('signory_user_updated', handleUpdate);
    return () => window.removeEventListener('signory_user_updated', handleUpdate);
  }, [user]);

  // Load stories on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getStories();
      setStories(data);
      if (storyId) {
        const found = data.find(s => s.id === storyId);
        if (found) {
          setSelectedStory(found);
          await loadChapters(found.id);
        }
      }
      setLoading(false);
    };
    load();
  }, [storyId]);

  const loadChapters = async (sid) => {
    const chs = await getChapters(sid);
    setChapters(chs);
    // Load lessons for each chapter
    const map = {};
    await Promise.all(chs.map(async ch => {
      const lessons = await getLessonsByChapter(ch.id);
      map[ch.id] = lessons;
    }));
    setLessonsByChapter(map);
    if (chs.length > 0) setExpandedChapter(chs[0].id);
  };

  const handleSelectStory = async (story) => {
    setSelectedStory(story);
    setChapters([]);
    setLessonsByChapter({});
    setLoading(true);
    try {
      sessionStorage.setItem('signory_last_learning_tab', `/stories/${story.id}`);
    } catch {}
    navigate(`/stories/${story.id}`);
    await loadChapters(story.id);
    setLoading(false);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedTamCamStory();
      const data = await getStories();
      setStories(data);
      alert('Đã tạo câu chuyện Tấm Cám mẫu thành công!');
    } catch (e) {
      alert('Lỗi khi tạo dữ liệu mẫu: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  // Check if a specific lesson is completed
  const isLessonCompleted = (lessonId) => {
    const p = userProgressMap[lessonId];
    return p?.status === 'completed' || p?.completed === true || userProfile?.completedLessons?.includes(lessonId);
  };

  const getStars = (lesson) => {
    const p = userProgressMap[lesson.id];
    return p?.stars || 0;
  };

  // A chapter is completed if it has lessons and all of them are completed
  const isChapterCompleted = (chapterId) => {
    const lessons = lessonsByChapter[chapterId] || [];
    if (lessons.length === 0) return false;
    return lessons.every(l => isLessonCompleted(l.id));
  };

  // Chapter unlock logic: Chapter 1 is default unlocked. Next chapters unlock when previous chapter completes or if admin unlocked it!
  const isChapterUnlocked = (ch, idx) => {
    if (ch.isLockedByDefault === false) return true; // Admin đã chủ động mở khóa
    if (ch.isLockedByDefault === true && idx === 0) return false; // Admin chủ động khóa chương 1
    if (idx === 0) return true; // Chương 1 mở theo mặc định
    const prevCh = chapters[idx - 1];
    if (!prevCh) return true;
    return isChapterCompleted(prevCh.id);
  };

  // Lesson unlock logic: Lesson 1 in chapter is default open, next lessons open when previous lesson completes!
  const isLessonUnlocked = (lesson, lIdx, chapterUnlocked, chapterLessons) => {
    if (!chapterUnlocked) return false;
    if (isLessonCompleted(lesson.id)) return true; // Đã hoàn thành thì xem lại thoải mái
    if (lesson.isLockedByDefault === false) return true; // Admin mở khóa
    if (lesson.isLockedByDefault === true && lIdx === 0) return false; // Admin khóa bài 1
    if (lIdx === 0) return true; // Bài 1 trong chương mở theo mặc định
    const prevLesson = chapterLessons[lIdx - 1];
    return isLessonCompleted(prevLesson?.id);
  };

  const handleToggleExpandChapter = (chapterId, unlocked, chIdx) => {
    if (!unlocked) {
      alert(`Chương ${chIdx + 1} đang bị khóa. Bạn hãy hoàn thành tất cả các bài của Chương ${chIdx} trước để mở khóa nhé!`);
      return;
    }
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Story listing screen
  if (!selectedStory) {
    return (
      <div className="min-h-screen relative overflow-x-clip py-10 px-4">
        <LearningMapBackdrop variant="story" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 bg-purple-100 dark:bg-purple-900/40 px-5 py-2 rounded-full mb-4">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              <span className="text-purple-700 dark:text-purple-300 font-black text-sm uppercase tracking-wide">Thư Viện Câu Chuyện</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2">Chọn Câu Chuyện</h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">Học ngôn ngữ ký hiệu qua những câu chuyện cổ tích thú vị</p>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700">
              <Layers className="w-16 h-16 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-700 dark:text-slate-200 mb-2">Chưa có câu chuyện nào</h3>
              <p className="text-slate-400 dark:text-slate-500 mb-6 text-sm font-semibold">Hãy tạo câu chuyện đầu tiên hoặc tải dữ liệu mẫu</p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition-all shadow-lg disabled:opacity-60"
              >
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {seeding ? 'Đang tạo...' : 'Tạo Câu Chuyện Tấm Cám Mẫu'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => handleSelectStory(story)}
                  className="group bg-white dark:bg-gray-800 rounded-3xl shadow-md hover:shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden transition-all hover:-translate-y-1 text-left"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={story.coverImage || PLACEHOLDER_COVER}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.src = PLACEHOLDER_COVER; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-black text-xl drop-shadow">{story.title}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold line-clamp-2">{story.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
                        Bắt đầu học →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chapter + Lesson view OR SIGN MIRROR view
  return (
    <div className="min-h-screen relative overflow-x-clip py-8 px-4">
      <LearningMapBackdrop variant="story" />
      <div className={`relative z-10 ${activeStoryTab === 'mirror' ? 'max-w-5xl' : 'max-w-3xl'} mx-auto transition-all duration-300`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <button onClick={() => { setSelectedStory(null); navigate('/stories'); }} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Thư Viện
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-purple-700 dark:text-purple-300 font-black">{selectedStory.title}</span>
        </div>

        {/* Story Header */}
        <div className="relative rounded-3xl overflow-hidden mb-6 shadow-xl">
          <img
            src={selectedStory.coverImage || PLACEHOLDER_COVER}
            alt={selectedStory.title}
            className="w-full h-48 object-cover"
            onError={e => { e.target.src = PLACEHOLDER_COVER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div>
              <h1 className="text-white font-black text-3xl drop-shadow mb-1">{selectedStory.title}</h1>
              <p className="text-white/80 text-sm font-semibold">{selectedStory.description}</p>
            </div>
          </div>
        </div>

        {/* Mode Switcher inside Story: 1. Học câu chuyện | 2. SIGN MIRROR */}
        <div className="grid grid-cols-2 gap-3 mb-7 bg-white dark:bg-gray-800 p-2 rounded-3xl border border-slate-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setSearchParams({})}
            className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              activeStoryTab === 'lessons'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Học Câu Chuyện</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'mirror' })}
            className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              activeStoryTab === 'mirror'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>SIGN MIRROR</span>
          </button>
        </div>

        {activeStoryTab === 'mirror' ? (
          <SignMirrorView
            story={selectedStory}
            onBackToLessons={() => setSearchParams({})}
          />
        ) : (
          <>
        {/* Chapters */}
        {chapters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700">
            <p className="text-slate-400 dark:text-slate-500 font-semibold">Câu chuyện này hiện chưa có chương nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter, chIdx) => {
              const lessons = lessonsByChapter[chapter.id] || [];
              const isExpanded = expandedChapter === chapter.id;
              const chUnlocked = isChapterUnlocked(chapter, chIdx);
              const chCompleted = isChapterCompleted(chapter.id);
              const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;

              return (
                <div 
                  key={chapter.id} 
                  className={`bg-white dark:bg-gray-800 rounded-3xl shadow-sm border transition-all overflow-hidden ${
                    !chUnlocked 
                      ? 'border-slate-200 dark:border-gray-700 opacity-70' 
                      : chCompleted
                      ? 'border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-200 dark:ring-emerald-800/40'
                      : 'border-slate-100 dark:border-gray-700'
                  }`}
                >
                  {/* Chapter Header */}
                  <button
                    onClick={() => handleToggleExpandChapter(chapter.id, chUnlocked, chIdx)}
                    className="w-full flex items-center gap-4 p-5 hover:bg-purple-50/60 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md ${
                      !chUnlocked
                        ? 'bg-slate-400 dark:bg-gray-600'
                        : chCompleted
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {!chUnlocked ? <Lock className="w-5 h-5" /> : (chCompleted ? <CheckCircle2 className="w-6 h-6 stroke-[2.5]" /> : chIdx + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-black text-slate-800 dark:text-white text-base">{chapter.title}</h2>
                        {!chUnlocked ? (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Khóa
                          </span>
                        ) : chCompleted ? (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            ✓ Hoàn thành
                          </span>
                        ) : (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                            Đang học
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-0.5">{chapter.description}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`text-xs font-black ${
                          !chUnlocked 
                            ? 'text-slate-400' 
                            : chCompleted 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-purple-600 dark:text-purple-400'
                        }`}>
                          {!chUnlocked 
                            ? `Hoàn thành Chương ${chIdx} để mở khóa` 
                            : `${completedCount}/${lessons.length} bài hoàn thành`
                          }
                        </div>
                        {lessons.length > 0 && chUnlocked && (
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                chCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                              }`}
                              style={{ width: `${(completedCount / lessons.length) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {chUnlocked && (
                      <ChevronRight className={`w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </button>

                  {/* Lessons in Chapter */}
                  {isExpanded && chUnlocked && (
                    <div className="border-t border-slate-100 dark:border-gray-700 p-4 space-y-3">
                      {lessons.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold text-center py-4">
                          Chương này chưa có bài học.
                        </p>
                      ) : (
                        lessons.map((lesson, lIdx) => {
                          const completed = isLessonCompleted(lesson.id);
                          const unlocked = isLessonUnlocked(lesson, lIdx, chUnlocked, lessons);
                          const stars = getStars(lesson);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                if (!unlocked) return;
                                const backTo = `/stories/${selectedStory.id}`;
                                try {
                                  sessionStorage.setItem('signory_last_learning_tab', backTo);
                                } catch {}
                                navigate(`/lesson/${lesson.id}?returnTo=${encodeURIComponent(backTo)}`);
                              }}
                              disabled={!unlocked}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                !unlocked
                                  ? 'border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-750 opacity-60 cursor-not-allowed'
                                  : completed
                                  ? 'border-green-300 dark:border-green-800 bg-green-50/70 dark:bg-green-900/20 hover:border-green-400'
                                  : 'border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-900/20 hover:border-purple-400 hover:shadow-md'
                              }`}
                            >
                              {/* Lesson number / status icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                !unlocked
                                  ? 'bg-slate-200 dark:bg-gray-600 text-slate-400 dark:text-slate-500'
                                  : completed
                                  ? 'bg-green-500 text-white shadow-sm'
                                  : 'bg-purple-600 text-white shadow-sm'
                              }`}>
                                {!unlocked ? <Lock className="w-4 h-4" /> : (completed ? '✓' : lIdx + 1)}
                              </div>

                              {/* Lesson info */}
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-black text-sm ${!unlocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                                  {lesson.title}
                                </h3>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">{lesson.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{lesson.estimatedMinutes || 3} phút</span>
                                  <span className="text-xs font-bold text-yellow-500">+{lesson.rewardPoints || 50} XP</span>
                                </div>
                              </div>

                              {/* Stars */}
                              {completed && (
                                <div className="flex gap-0.5 shrink-0">
                                  {[1, 2, 3].map(s => (
                                    <Star key={s} className={`w-4 h-4 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoryMapPage;
