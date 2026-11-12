import React, { useState } from 'react';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import ImageSelectionQuestion from './ImageSelectionQuestion';
import WordArrangementQuestion from './WordArrangementQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import MatchingQuestion from './MatchingQuestion';
import VideoRecognitionQuestion from './VideoRecognitionQuestion';
import FillBlankQuestion from './FillBlankQuestion';
import FeedbackBanner from './FeedbackBanner';
import { useSound } from '../../context/SoundContext';

export const QuestionRenderer = ({ 
  question, 
  onNext, 
  isKidsMode = false 
}) => {
  const [answeredState, setAnsweredState] = useState(null); // { isCorrect: boolean }
  const { playCorrect, playIncorrect } = useSound();

  const handleAnswer = (isCorrect) => {
    if (answeredState !== null) return;
    setAnsweredState({ isCorrect });
    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleContinue = () => {
    const isCorrect = answeredState?.isCorrect || false;
    setAnsweredState(null);
    onNext(isCorrect);
  };

  const renderQuestionType = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
      case 'image-selection':
        return (
          <ImageSelectionQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
            isKidsMode={isKidsMode}
          />
        );
      case 'word-arrangement':
        return (
          <WordArrangementQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
      case 'true-false':
        return (
          <TrueFalseQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
      case 'matching':
        return (
          <MatchingQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
      case 'video-recognition':
        return (
          <VideoRecognitionQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
      case 'fill-blank':
        return (
          <FillBlankQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
      default:
        return (
          <MultipleChoiceQuestion
            question={question}
            onAnswer={handleAnswer}
            disabled={answeredState !== null}
          />
        );
    }
  };

  return (
    <div className="relative pb-28">
      {renderQuestionType()}

      {/* Floating feedback bottom sheet */}
      {answeredState !== null && (
        <FeedbackBanner
          isCorrect={answeredState.isCorrect}
          feedback={
            answeredState.isCorrect
              ? (question.correctFeedback || 'Chính xác! Bạn làm rất tốt.')
              : (question.incorrectFeedback || 'Chưa đúng rồi! Hãy cùng thử lại nhé.')
          }
          explanation={question.explanation}
          points={question.points || 10}
          onContinue={handleContinue}
          isKidsMode={isKidsMode}
        />
      )}
    </div>
  );
};

export default QuestionRenderer;
