import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Volume2, 
  VolumeX, 
  Baby, 
  Home 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getLessonDetails, saveLessonProgress } from '../services/dbService';
import ContentBlockRenderer from '../components/lesson/ContentBlockRenderer';
import QuestionRenderer from '../components/quiz/QuestionRenderer';
import LessonCompletionModal from '../components/lesson/LessonCompletionModal';
import AtmosphericBackdrop from '../components/common/AtmosphericBackdrop';

export const LessonPlayerPage = () => {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { soundEnabled, toggleSound, playClick, playCorrect, playIncorrect } = useSound();

  const [lesson, setLesson] = useState(null);
  const [steps, setSteps] = useState([]); // Array of { type: 'block' | 'quiz', data: any }
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLessonStartSplash, setShowLessonStartSplash] = useState(true);

  // Check if current flow is Kids Mode
  const isKidsMode = searchParams.get('mode') === 'kids' || lesson?.mode === 'kids';

  useEffect(() => {
    if (!loading && lesson && showLessonStartSplash) {
      const t = setTimeout(() => setShowLessonStartSplash(false), 1150);
      return () => clearTimeout(t);
    }
  }, [loading, lesson, showLessonStartSplash]);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const details = await getLessonDetails(lessonId);
        if (!details) {
          navigate(isKidsMode ? '/kids' : '/parents');
          return;
        }

        setLesson(details);

        // Build combined sequence of content blocks and quizzes
        const combined = [];
        const blocks = details.blocks || [];
        const questions = details.questions || [];
        let quizCount = 0;

        blocks.forEach((block) => {
          if (block.type === 'quiz' && block.quizRefId) {
            const matchedQuestion = questions.find(q => q.id === block.quizRefId);
            if (matchedQuestion) {
              combined.push({ type: 'quiz', data: matchedQuestion });
              quizCount += 1;
            }
          } else {
            combined.push({ type: 'block', data: block });
          }
        });

        // Append any standalone questions
        const linkedQIds = blocks.filter(b => b.type === 'quiz').map(b => b.quizRefId);
        questions.forEach(q => {
          if (!linkedQIds.includes(q.id)) {
            combined.push({ type: 'quiz', data: q });
            quizCount += 1;
          }
        });

        setSteps(combined);
        setTotalQuizzes(quizCount);
      } catch (err) {
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const currentStep = steps[currentStepIndex];

  const handleNextStep = async (isQuizCorrect = null) => {
    let newCorrect = correctAnswers;
    if (isQuizCorrect === true) {
      newCorrect += 1;
      setCorrectAnswers(newCorrect);
    }

    if (currentStepIndex + 1 < steps.length) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Completed the entire lesson!
      const total = totalQuizzes || 1;
      const points = lesson?.rewardPoints || 50;
      const effectiveUid = user?.uid || 'guest';

      const result = await saveLessonProgress({
        uid: effectiveUid,
        lessonId: lesson.id,
        score: newCorrect * 20,
        totalQuestions: total,
        correctAnswers: newCorrect,
        lessonRewardPoints: points
      });
      setCompletionResult(result);
      setIsCompleted(true);
    }
  };

  // Resolve exact origin tab to return to on exit or completion
  const resolveReturnPath = (loadedLesson) => {
    const paramReturn = searchParams.get('returnTo');
    if (paramReturn) return paramReturn;
    try {
      const stored = sessionStorage.getItem('signory_last_learning_tab');
      if (stored) return stored;
    } catch {}
    if (loadedLesson?.storyId) return `/stories/${loadedLesson.storyId}`;
    return isKidsMode ? '/kids' : '/parents';
  };

  const handleReplay = () => {
    playClick();
    setCurrentStepIndex(0);
    setCorrectAnswers(0);
    setIsCompleted(false);
    setCompletionResult(null);
  };

  const handleExit = () => {
    playClick();
    navigate(resolveReturnPath(lesson));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className={`w-12 h-12 border-4 ${isKidsMode ? 'border-duo-purple' : 'border-brand-500'} border-t-transparent rounded-full animate-spin`} />
        <p className="font-bold text-slate-500">Đang chuẩn bị bài học...</p>
      </div>
    );
  }

  const progressPercent = steps.length > 0 
    ? ((currentStepIndex + 1) / steps.length) * 100 
    : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      <AtmosphericBackdrop variant={isKidsMode ? 'lesson-kids' : 'lesson-parents'} />
      {/* Lesson Start Fullscreen Opaque Illustrated Backdrop Splash (Section 6.4) */}
      <AnimatePresence>
        {showLessonStartSplash && lesson && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.38 }}
            className={`fixed inset-0 z-[80] overflow-hidden flex flex-col items-center justify-center p-6 text-center ${
              isKidsMode
                ? 'bg-gradient-to-br from-sky-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900'
                : 'bg-gradient-to-br from-[#fdf8ed] via-emerald-100 to-amber-100 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-900'
            }`}
          >
            {/* Full opaque decorative background layers behind splash card */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-70 dark:opacity-35"
                style={{
                  background: isKidsMode
                    ? 'radial-gradient(circle, rgba(192, 132, 252, 0.55), transparent 70%)'
                    : 'radial-gradient(circle, rgba(251, 191, 36, 0.45), transparent 70%)',
                }}
              />
              <div
                className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-70 dark:opacity-35"
                style={{
                  background: isKidsMode
                    ? 'radial-gradient(circle, rgba(56, 189, 248, 0.5), transparent 70%)'
                    : 'radial-gradient(circle, rgba(52, 211, 153, 0.4), transparent 70%)',
                }}
              />
              <div className="absolute top-[14%] left-[10%] animate-cloud-slow opacity-75 dark:opacity-25">
                <svg width="150" viewBox="0 0 200 90" fill="none">
                  <path
                    d="M42 74h112c17.673 0 32-12.536 32-28 0-14.3-12.226-26.1-28.11-27.79C152.08 7.59 140.48 0 127 0c-16.84 0-31.02 10.75-35.84 25.56C87.17 23.92 82.72 23 78 23c-16.016 0-29 12.088-29 27 0 1.48.128 2.932.374 4.342C36.04 56.08 26 64.17 26 74h16z"
                    fill="var(--signory-cloud)"
                  />
                </svg>
              </div>
              <div className="absolute bottom-[16%] right-[12%] animate-wind-float">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C16.5 6 19 11 16 17C14 20.5 9.5 21 6.5 18C3.5 15 4 9.5 8 5.5C9.5 4 10.8 2.8 12 2Z"
                    fill="var(--signory-petal)"
                  />
                </svg>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.78, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-[36px] p-8 md:p-10 border-4 border-white/80 dark:border-slate-700 shadow-2xl space-y-4 max-w-lg w-full"
            >
              {lesson.thumbnail ? (
                <img
                  src={lesson.thumbnail}
                  alt={lesson.title}
                  className="w-24 h-24 rounded-3xl mx-auto object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
                    isKidsMode ? 'bg-duo-purple text-white' : 'bg-brand-500 text-white'
                  }`}
                >
                  {isKidsMode ? <Baby className="w-9 h-9" /> : <Sparkles className="w-9 h-9" />}
                </div>
              )}
              {lesson.topic && (
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isKidsMode
                      ? 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {lesson.topic}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                {lesson.title}
              </h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-300">
                {isKidsMode ? 'Sẵn sàng vui học ký hiệu nào! ✨' : 'Hít một hơi thật nhẹ và bắt đầu nhé...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header / Progress Bar */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          onClick={handleExit}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          title="Thoát bài học"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 md:h-5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700 shadow-inner flex items-center">
          <motion.div
            className={`h-full rounded-full transition-all ${
              isKidsMode
                ? 'bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500'
                : 'bg-brand-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? (
            <Volume2 className={`w-5 h-5 ${isKidsMode ? 'text-duo-purple' : 'text-brand-600'}`} />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Step Content */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {currentStep?.type === 'block' ? (
              <div className="space-y-6">
                <ContentBlockRenderer block={currentStep.data} />
                
                {/* Next button for content blocks */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => { playClick(); handleNextStep(); }}
                    className={`px-8 py-3.5 rounded-2xl font-black text-white btn-3d flex items-center gap-2 text-base shadow-md ${
                      isKidsMode ? 'btn-purple-3d' : 'btn-green-3d'
                    }`}
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ) : currentStep?.type === 'quiz' ? (
              <QuestionRenderer
                question={currentStep.data}
                onNext={(isCorrect) => handleNextStep(isCorrect)}
                isKidsMode={isKidsMode}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Completion Modal */}
      {isCompleted && (
        <LessonCompletionModal
          stars={completionResult?.stars || 3}
          score={correctAnswers * 20}
          xpGained={completionResult?.xpGained || lesson?.rewardPoints || 40}
          correctCount={correctAnswers}
          totalQuestions={totalQuizzes || 1}
          newBadges={completionResult?.newlyAwardedBadges || []}
          onReturnToMap={handleExit}
          onReplay={handleReplay}
          isKidsMode={isKidsMode}
        />
      )}
    </div>
  );
};

export default LessonPlayerPage;
