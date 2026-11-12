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

  // Check if current flow is Kids Mode
  const isKidsMode = searchParams.get('mode') === 'kids' || lesson?.mode === 'kids';

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

      if (user) {
        const result = await saveLessonProgress({
          uid: user.uid,
          lessonId: lesson.id,
          score: newCorrect * 20,
          totalQuestions: total,
          correctAnswers: newCorrect,
          lessonRewardPoints: points
        });
        setCompletionResult(result);
      } else {
        const stars = newCorrect === total ? 3 : (newCorrect > 0 ? 2 : 1);
        setCompletionResult({
          stars,
          xpGained: points,
          newlyAwardedBadges: []
        });
      }
      setIsCompleted(true);
    }
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
    navigate(isKidsMode ? '/kids' : '/parents');
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
    <div className={`min-h-screen flex flex-col justify-between ${
      isKidsMode ? 'bg-gradient-to-b from-sky-50 via-purple-50 to-pink-50' : 'bg-white'
    }`}>
      {/* Top Header / Progress Bar */}
      <div className="max-w-4xl w-full mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          onClick={handleExit}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title="Thoát bài học"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-slate-100 h-4 md:h-5 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner flex items-center">
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
          className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col justify-center">
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
