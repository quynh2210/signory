import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  HelpCircle, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  UploadCloud,
  ChevronDown,
  Baby,
  Split,
  Layers,
  X
} from 'lucide-react';
import { 
  getLessonDetails, 
  saveLessonAdmin, 
  saveLessonBlocksAdmin, 
  saveQuestionAdmin 
} from '../../services/dbService';
import { uploadMediaToCloudinary } from '../../services/cloudinaryService';
import { useSound } from '../../context/SoundContext';
import ContentBlockRenderer from '../../components/lesson/ContentBlockRenderer';
import QuestionRenderer from '../../components/quiz/QuestionRenderer';

export const AdminLessonBuilder = () => {
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lessonId');
  const navigate = useNavigate();
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [lessonData, setLessonData] = useState({
    id: lessonIdParam || `lesson-${Date.now()}`,
    title: '',
    description: '',
    topic: 'Chủ đề mới',
    mode: 'parents', // 'parents' | 'kids' | 'both'
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    rewardPoints: 50,
    estimatedMinutes: 3,
    isPublished: true,
    isLockedByDefault: false
  });

  const [blocks, setBlocks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load existing lesson if editing
  useEffect(() => {
    if (lessonIdParam) {
      const loadLesson = async () => {
        const data = await getLessonDetails(lessonIdParam);
        if (data) {
          setLessonData({
            id: data.id,
            title: data.title || '',
            description: data.description || '',
            topic: data.topic || '',
            mode: data.mode || 'parents',
            thumbnail: data.thumbnail || '',
            rewardPoints: data.rewardPoints || 50,
            estimatedMinutes: data.estimatedMinutes || 3,
            isPublished: Boolean(data.isPublished),
            isLockedByDefault: Boolean(data.isLockedByDefault)
          });
          setBlocks(data.blocks || []);
          setQuestions(data.questions || []);
        }
      };
      loadLesson();
    }
  }, [lessonIdParam]);

  // Block management
  const addTextBlock = () => {
    playClick();
    const newBlock = {
      id: `block-${Date.now()}`,
      lessonId: lessonData.id,
      type: 'text',
      order: blocks.length + 1,
      content: {
        title: 'Giới thiệu ký hiệu mới',
        body: 'Hướng dẫn cách cử động bàn tay theo tranh truyện...',
        tip: 'Mẹo nhớ từ sách truyện tranh.'
      }
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const addVideoBlock = () => {
    playClick();
    const newBlock = {
      id: `block-${Date.now()}`,
      lessonId: lessonData.id,
      type: 'video',
      order: blocks.length + 1,
      content: {
        title: 'Video hướng dẫn ký hiệu',
        description: 'Mô tả động tác chi tiết.',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: '',
        disclaimer: 'Video ký hiệu minh họa mẫu.'
      }
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const addImageBlock = () => {
    playClick();
    const newBlock = {
      id: `block-${Date.now()}`,
      lessonId: lessonData.id,
      type: 'image',
      order: blocks.length + 1,
      content: {
        title: 'Hình ảnh minh họa',
        mediaUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
        caption: 'Hình vẽ minh họa trong cuốn sách truyện tranh.'
      }
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const addQuizBlock = (type = 'multiple-choice') => {
    playClick();
    const qId = `q-${Date.now()}`;
    let newQuestion = {
      id: qId,
      lessonId: lessonData.id,
      type: type,
      questionTitle: type === 'image-selection' ? 'Ký hiệu này là gì bé ơi?' : (type === 'matching' ? 'Nối các cặp tương ứng' : (type === 'word-arrangement' ? 'Sắp xếp câu hoàn chỉnh' : 'Câu hỏi kiểm tra kiến thức')),
      questionText: type === 'matching' ? 'Hãy nối động tác ký hiệu với ý nghĩa hoặc hình ảnh tương ứng:' : 'Quan sát và chọn đáp án chính xác:',
      questionImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600',
      points: 15,
      correctFeedback: 'Chính xác! Bạn làm rất tốt.',
      incorrectFeedback: 'Chưa chính xác, hãy thử lại nhé!',
      explanation: 'Giải thích chi tiết về câu hỏi này.',
      order: questions.length + 1
    };

    if (type === 'multiple-choice') {
      newQuestion.answerOptions = [
        { id: 'opt-1', text: 'Đáp án A (Đúng)', isCorrect: true },
        { id: 'opt-2', text: 'Đáp án B', isCorrect: false },
        { id: 'opt-3', text: 'Đáp án C', isCorrect: false }
      ];
      newQuestion.correctAnswer = 'opt-1';
    } else if (type === 'image-selection') {
      newQuestion.targetWord = 'NHÀ';
      newQuestion.letters = ['N', 'H', 'À'];
      newQuestion.correctFeedback = 'Hoan hô bé! Bé nhớ chữ: N – H – À nhé!';
      newQuestion.incorrectFeedback = 'Chưa đúng rồi! Bé hãy tìm hình ngôi nhà xinh xắn nhé!';
      newQuestion.explanation = 'Hai bàn tay chụm lại hình tam giác như mái nhà ấm áp.';
      newQuestion.answerOptions = [
        { id: 'img-1', label: 'Ngôi nhà', imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400', isCorrect: true },
        { id: 'img-2', label: 'Quả táo', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', isCorrect: false },
        { id: 'img-3', label: 'Mèo con', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', isCorrect: false },
        { id: 'img-4', label: 'Xe hơi', imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', isCorrect: false }
      ];
      newQuestion.correctAnswer = 'img-1';
    } else if (type === 'word-arrangement') {
      newQuestion.targetSentence = 'TÔI MUỐN ĂN';
      newQuestion.words = ['TÔI', 'MUỐN', 'ĂN'];
      newQuestion.distractorWords = ['NGỦ', 'ĐI'];
      newQuestion.correctSequence = ['TÔI', 'MUỐN', 'ĂN'];
      newQuestion.correctFeedback = 'Tuyệt vời! Bạn đã sắp xếp đúng câu!';
      newQuestion.incorrectFeedback = 'Chưa đúng thứ tự, hãy thử sắp xếp lại nhé.';
      newQuestion.explanation = 'Thứ tự đúng: TÔI -> MUỐN -> ĂN.';
    } else if (type === 'matching') {
      newQuestion.pairs = [
        { id: 'p1', leftText: 'Ký hiệu Mái nhà', leftImage: '', rightText: 'Ngôi nhà', rightImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200' },
        { id: 'p2', leftText: 'Chụm tay ở miệng', leftImage: '', rightText: 'Bé ăn cơm', rightImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200' },
        { id: 'p3', leftText: 'Áp tay vào má', leftImage: '', rightText: 'Bé ngủ ngoan', rightImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200' }
      ];
      newQuestion.correctFeedback = 'Quá xuất sắc! Bạn đã ghép đôi chính xác tất cả các cặp!';
      newQuestion.incorrectFeedback = 'Hãy kiểm tra lại một vài cặp chưa khớp nhé.';
      newQuestion.explanation = 'Các ký hiệu đều mang ý nghĩa rất gần gũi với đời sống hằng ngày.';
    } else if (type === 'true-false') {
      newQuestion.correctAnswer = 'true';
      newQuestion.correctFeedback = 'Chính xác! Nhận định này hoàn toàn đúng.';
      newQuestion.incorrectFeedback = 'Chưa chính xác rồi!';
    }

    setQuestions(prev => [...prev, newQuestion]);

    const newBlock = {
      id: `block-${Date.now()}`,
      lessonId: lessonData.id,
      type: 'quiz',
      quizRefId: qId,
      order: blocks.length + 1
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const removeBlock = (blockId) => {
    playClick();
    const blockToRemove = blocks.find(b => b.id === blockId);
    if (blockToRemove?.type === 'quiz' && blockToRemove.quizRefId) {
      setQuestions(prev => prev.filter(q => q.id !== blockToRemove.quizRefId));
    }
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const moveBlock = (index, direction) => {
    playClick();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
  };

  // Cloudinary upload helper for blocks
  const handleUploadBlockMedia = async (blockId, file, type = 'image') => {
    setUploadingBlockId(blockId);
    setUploadProgress(0);
    try {
      const result = await uploadMediaToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });
      playCorrect();
      setBlocks(prev => prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            content: {
              ...b.content,
              mediaUrl: result.url,
              publicId: result.publicId
            }
          };
        }
        return b;
      }));
    } catch (err) {
      playIncorrect();
      alert(`Lỗi upload Cloudinary: ${err.message}`);
    } finally {
      setUploadingBlockId(null);
      setUploadProgress(0);
    }
  };

  // Upload option image for quiz
  const handleUploadOptionImage = async (qId, optionId, file) => {
    try {
      const result = await uploadMediaToCloudinary(file, () => {});
      playCorrect();
      setQuestions(prev => prev.map(q => {
        if (q.id === qId && q.answerOptions) {
          const updatedOptions = q.answerOptions.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, imageUrl: result.url };
            }
            return opt;
          });
          return { ...q, answerOptions: updatedOptions };
        }
        return q;
      }));
    } catch (err) {
      playIncorrect();
      alert(`Lỗi upload ảnh đáp án: ${err.message}`);
    }
  };

  // Upload pair media for matching question
  const handleUploadPairMedia = async (qId, pairId, side, file) => {
    try {
      const result = await uploadMediaToCloudinary(file, () => {});
      playCorrect();
      setQuestions(prev => prev.map(q => {
        if (q.id === qId && q.pairs) {
          const field = side === 'left' ? 'leftImage' : 'rightImage';
          const updatedPairs = q.pairs.map(p => {
            if (p.id === pairId) {
              return { ...p, [field]: result.url };
            }
            return p;
          });
          return { ...q, pairs: updatedPairs };
        }
        return q;
      }));
    } catch (err) {
      playIncorrect();
      alert(`Lỗi upload ảnh cặp ghép đôi: ${err.message}`);
    }
  };

  // Auto split sentence for word arrangement
  const handleSplitSentence = (qId, sentence) => {
    if (!sentence) return;
    const words = sentence.trim().split(/\s+/).filter(Boolean).map(w => w.toUpperCase());
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          targetSentence: sentence,
          words: words,
          correctSequence: words
        };
      }
      return q;
    }));
  };

  // Save the entire lesson
  const handleSaveLesson = async () => {
    if (!lessonData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài học!');
      return;
    }

    setIsSaving(true);
    playClick();
    try {
      // 1. Save lesson document
      await saveLessonAdmin(lessonData);

      // 2. Save all blocks
      await saveLessonBlocksAdmin(lessonData.id, blocks);

      // 3. Save all questions
      for (const q of questions) {
        await saveQuestionAdmin(q);
      }

      playCorrect();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      playIncorrect();
      console.error(err);
      alert('Lỗi lưu bài học: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            {lessonIdParam ? 'Chỉnh Sửa Bài Học' : 'Tạo Bài Học Mới'}
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Toàn quyền tạo bộ câu hỏi, video ký hiệu và nội dung cho Phụ Huynh và Bé
          </p>
        </div>

        {/* Tab switch & Save action */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => { playClick(); setActiveTab('editor'); }}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'editor' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Trình chỉnh sửa
            </button>
            <button
              onClick={() => { playClick(); setActiveTab('preview'); }}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === 'preview' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước (Live Preview)</span>
            </button>
          </div>

          <button
            onClick={handleSaveLesson}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl font-black text-white btn-3d btn-green-3d flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu & Xuất Bản'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-emerald-800 font-bold flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Bài học và toàn bộ câu hỏi đã được lưu thành công!</span>
        </div>
      )}

      {/* Mode View: Preview vs Editor */}
      {activeTab === 'preview' ? (
        /* LIVE PREVIEW MODE */
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-200 shadow-sm space-y-8">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-800 text-xs font-bold flex items-center justify-between">
            <span>🔍 Đang xem trước trải nghiệm học tập thực tế ({lessonData.mode === 'kids' ? 'Chế độ Bé' : 'Chế độ Phụ huynh'})</span>
            <button
              onClick={() => setActiveTab('editor')}
              className="text-purple-700 underline font-black"
            >
              Quay lại chỉnh sửa
            </button>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {blocks.map((block) => {
              if (block.type === 'quiz') {
                const q = questions.find(item => item.id === block.quizRefId);
                return q ? (
                  <div key={block.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-purple-100">
                    <QuestionRenderer 
                      question={q} 
                      onNext={() => alert('Đã kiểm tra xong câu hỏi!')} 
                      isKidsMode={lessonData.mode === 'kids'}
                    />
                  </div>
                ) : null;
              }
              return <ContentBlockRenderer key={block.id} block={block} />;
            })}
          </div>
        </div>
      ) : (
        /* BUILDER EDITOR MODE */
        <div className="space-y-8">
          {/* Section 1: Lesson Metadata */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>1. Thông Tin Cơ Bản Của Bài Học</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Tiêu đề bài học *
                </label>
                <input
                  type="text"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                  placeholder="Ví dụ: Bài 1: Ở nhà cùng bé"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Chủ đề / Nhóm bài
                </label>
                <input
                  type="text"
                  value={lessonData.topic}
                  onChange={(e) => setLessonData({ ...lessonData, topic: e.target.value })}
                  placeholder="Ví dụ: Ở nhà, Gia đình, Trường học..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Mô tả bài học
                </label>
                <textarea
                  rows={2}
                  value={lessonData.description}
                  onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung bài học..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-semibold text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Chế độ áp dụng
                </label>
                <select
                  value={lessonData.mode}
                  onChange={(e) => setLessonData({ ...lessonData, mode: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500 bg-white"
                >
                  <option value="parents">Chế độ Phụ huynh</option>
                  <option value="kids">Chế độ Bé</option>
                  <option value="both">Cả hai chế độ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Điểm thưởng hoàn thành (EXP)
                </label>
                <input
                  type="number"
                  value={lessonData.rewardPoints}
                  onChange={(e) => setLessonData({ ...lessonData, rewardPoints: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Ảnh bìa (Thumbnail URL)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={lessonData.thumbnail}
                    onChange={(e) => setLessonData({ ...lessonData, thumbnail: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 font-medium text-sm outline-none focus:border-purple-500"
                  />
                  {lessonData.thumbnail && (
                    <img src={lessonData.thumbnail} alt="Bìa" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Content & Quiz Blocks */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>2. Các Phần Nội Dung & Câu Hỏi Tương Tác ({blocks.length} phần)</span>
              </h3>

              {/* Add Block Toolbar */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addTextBlock}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>+ Văn bản</span>
                </button>
                <button
                  type="button"
                  onClick={addVideoBlock}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>+ Video Ký Hiệu</span>
                </button>
                <button
                  type="button"
                  onClick={addImageBlock}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>+ Hình ảnh</span>
                </button>
                
                {/* Add Quiz Buttons Toolbar */}
                <div className="flex flex-wrap gap-1 bg-purple-50 p-1 rounded-xl border border-purple-200">
                  <button
                    type="button"
                    onClick={() => addQuizBlock('image-selection')}
                    className="px-2.5 py-1 rounded-lg bg-duo-purpleDark hover:bg-purple-900 text-white font-black text-xs flex items-center gap-1 shadow-sm"
                    title="Đoán hình (Chế độ bé & ghép chữ)"
                  >
                    <Baby className="w-3.5 h-3.5" />
                    <span>+ Đoán hình (Bé)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuizBlock('matching')}
                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-1 shadow-sm"
                    title="Nối các cặp tương ứng (Hình hoặc Chữ)"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>+ Ghép Đôi (Matching)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuizBlock('word-arrangement')}
                    className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-black text-xs flex items-center gap-1 shadow-sm"
                    title="Sắp xếp từ"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>+ Sắp xếp từ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuizBlock('multiple-choice')}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm"
                    title="Câu hỏi trắc nghiệm"
                  >
                    + Trắc nghiệm
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuizBlock('true-false')}
                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm"
                    title="Đúng / Sai"
                  >
                    + Đúng/Sai
                  </button>
                </div>
              </div>
            </div>

            {/* Blocks List */}
            {blocks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-slate-200 text-center space-y-2">
                <p className="font-bold text-slate-500 text-base">Bài học chưa có nội dung nào.</p>
                <p className="text-xs text-slate-400">Hãy nhấn các nút phía trên để thêm Văn bản, Video ký hiệu hoặc Câu hỏi tương tác.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, idx) => {
                  const isQuiz = block.type === 'quiz';
                  const currentQ = isQuiz ? questions.find(q => q.id === block.quizRefId) : null;

                  return (
                    <div
                      key={block.id}
                      className="bg-white rounded-3xl p-5 md:p-6 border-2 border-slate-200 shadow-sm space-y-4 hover:border-purple-200 transition-all"
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-sm text-slate-800 capitalize">
                            Phần {idx + 1}: {block.type === 'text' && 'Đoạn văn bản'}
                            {block.type === 'video' && 'Video Ký Hiệu'}
                            {block.type === 'image' && 'Hình ảnh minh họa'}
                            {block.type === 'quiz' && `Câu hỏi (${
                              currentQ?.type === 'matching' ? 'Ghép Đôi' : (
                                currentQ?.type === 'word-arrangement' ? 'Sắp Xếp Từ' : (
                                  currentQ?.type === 'image-selection' ? 'Đoán Hình (Bé)' : (
                                    currentQ?.type === 'true-false' ? 'Đúng/Sai' : 'Trắc nghiệm'
                                  )
                                )
                              )
                            })`}
                          </span>
                        </div>

                        {/* Block controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                            title="Lên trên"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 1)}
                            disabled={idx === blocks.length - 1}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                            title="Xuống dưới"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all ml-2"
                            title="Xóa phần này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Block Body depending on Type */}
                      {block.type === 'text' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Tiêu đề đoạn văn..."
                            value={block.content?.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, title: val } } : b));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
                          />
                          <textarea
                            rows={3}
                            placeholder="Nội dung hướng dẫn ký hiệu..."
                            value={block.content?.body || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, body: val } } : b));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-sm outline-none focus:border-purple-500"
                          />
                          <input
                            type="text"
                            placeholder="Mẹo nhớ từ sách tranh (tùy chọn)..."
                            value={block.content?.tip || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, tip: val } } : b));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs outline-none focus:border-purple-500 bg-amber-50/50"
                          />
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="URL Video (mp4)..."
                              value={block.content?.mediaUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, mediaUrl: val } } : b));
                              }}
                              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-xs outline-none focus:border-purple-500"
                            />
                            <label className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1">
                              <UploadCloud className="w-4 h-4" />
                              <span>{uploadingBlockId === block.id ? `${uploadProgress}%` : 'Upload Cloudinary'}</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleUploadBlockMedia(block.id, e.target.files[0], 'video');
                                }}
                              />
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Tên ký hiệu (VD: Ký hiệu NHÀ)..."
                              value={block.content?.title || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, title: val } } : b));
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
                            />
                            <input
                              type="text"
                              placeholder="Ghi chú minh họa (Disclaimer)..."
                              value={block.content?.disclaimer || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, disclaimer: val } } : b));
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="URL Hình ảnh..."
                              value={block.content?.mediaUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, mediaUrl: val } } : b));
                              }}
                              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-xs outline-none focus:border-purple-500"
                            />
                            <label className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1">
                              <UploadCloud className="w-4 h-4" />
                              <span>{uploadingBlockId === block.id ? `${uploadProgress}%` : 'Upload Cloudinary'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleUploadBlockMedia(block.id, e.target.files[0], 'image');
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="Chú thích ảnh..."
                            value={block.content?.caption || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: { ...b.content, caption: val } } : b));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-xs outline-none focus:border-purple-500"
                          />
                        </div>
                      )}

                      {/* Specialized Quiz Forms */}
                      {block.type === 'quiz' && currentQ && (
                        <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Tiêu đề câu hỏi</label>
                              <input
                                type="text"
                                placeholder="Tiêu đề câu hỏi..."
                                value={currentQ.questionTitle || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, questionTitle: val } : q));
                                }}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nội dung câu hỏi / Lời thoại</label>
                              <input
                                type="text"
                                placeholder="Nội dung câu hỏi..."
                                value={currentQ.questionText || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, questionText: val } : q));
                                }}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-sm bg-white"
                              />
                            </div>
                          </div>

                          {/* 1. MATCHING (GHÉP ĐÔI) FORM */}
                          {currentQ.type === 'matching' && (
                            <div className="space-y-4 bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-black text-sky-900 text-sm flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-sky-600" />
                                    <span>Danh sách các cặp Ghép Đôi (Chọn Hình hoặc Chữ đều được)</span>
                                  </h5>
                                  <p className="text-xs text-slate-500">Mỗi vế có thể nhập chữ, dán link hình ảnh hoặc upload trực tiếp.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPairs = [
                                      ...(currentQ.pairs || []),
                                      { id: `p-${Date.now()}`, leftText: '', leftImage: '', rightText: '', rightImage: '' }
                                    ];
                                    setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, pairs: newPairs } : q));
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-1 shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Thêm Cặp Mới</span>
                                </button>
                              </div>

                              <div className="space-y-3">
                                {currentQ.pairs?.map((pair, pIdx) => (
                                  <div key={pair.id} className="p-3.5 bg-white rounded-2xl border border-sky-200 space-y-3 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                      <span className="font-black text-xs text-sky-800">Cặp #{pIdx + 1}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const filtered = currentQ.pairs.filter(p => p.id !== pair.id);
                                          setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, pairs: filtered } : q));
                                        }}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded-lg text-xs font-bold"
                                        title="Xóa cặp này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {/* Left side */}
                                      <div className="space-y-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[11px] font-black uppercase text-slate-500">Vế Trái (Ký hiệu)</span>
                                        <input
                                          type="text"
                                          placeholder="Chữ mô tả vế trái..."
                                          value={pair.leftText || pair.left || ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const updated = currentQ.pairs.map(p => p.id === pair.id ? { ...p, leftText: val, left: val } : p);
                                            setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, pairs: updated } : q));
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                                        />
                                        <div className="flex gap-2 items-center">
                                          <input
                                            type="text"
                                            placeholder="URL ảnh (tùy chọn)..."
                                            value={pair.leftImage || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              const updated = currentQ.pairs.map(p => p.id === pair.id ? { ...p, leftImage: val } : p);
                                              setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, pairs: updated } : q));
                                            }}
                                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono bg-white"
                                          />
                                          <label className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[10px] rounded-lg cursor-pointer shrink-0">
                                            <span>Upload</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                if (e.target.files?.[0]) handleUploadPairMedia(currentQ.id, pair.id, 'left', e.target.files[0]);
                                              }}
                                            />
                                          </label>
                                          {pair.leftImage && (
                                            <img src={pair.leftImage} alt="Vế trái" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                                          )}
                                        </div>
                                      </div>

                                      {/* Right side */}
                                      <div className="space-y-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[11px] font-black uppercase text-slate-500">Vế Phải (Ý nghĩa / Hình ảnh tương ứng)</span>
                                        <input
                                          type="text"
                                          placeholder="Chữ mô tả vế phải..."
                                          value={pair.rightText || pair.right || ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const updated = currentQ.pairs.map(p => p.id === pair.id ? { ...p, rightText: val, right: val } : p);
                                            setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, pairs: updated } : q));
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                                        />
                                        <div className="flex gap-2 items-center">
                                          <input
                                            type="text"
                                            placeholder="URL ảnh (tùy chọn)..."
                                            value={pair.rightImage || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              const updated = currentQ.pairs.map(p => p.id === pair.id ? { ...p, rightImage: val } : p);
                                              setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, pairs: updated } : q));
                                            }}
                                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono bg-white"
                                          />
                                          <label className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[10px] rounded-lg cursor-pointer shrink-0">
                                            <span>Upload</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                if (e.target.files?.[0]) handleUploadPairMedia(currentQ.id, pair.id, 'right', e.target.files[0]);
                                              }}
                                            />
                                          </label>
                                          {pair.rightImage && (
                                            <img src={pair.rightImage} alt="Vế phải" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. WORD ARRANGEMENT FORM */}
                          {currentQ.type === 'word-arrangement' && (
                            <div className="space-y-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                              <h5 className="font-black text-emerald-900 text-sm flex items-center gap-1.5">
                                <Split className="w-4 h-4 text-emerald-600" />
                                <span>Cấu Hình Sắp Xếp Từ (Duolingo Style)</span>
                              </h5>

                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700">
                                  Đáp án câu hoàn chỉnh (Viết cách nhau bằng dấu cách):
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ví dụ: TÔI MUỐN ĂN"
                                    value={currentQ.targetSentence || currentQ.words?.join(' ') || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, targetSentence: val } : q));
                                    }}
                                    className="flex-1 px-3.5 py-2 rounded-xl border border-emerald-300 font-bold text-sm bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSplitSentence(currentQ.id, currentQ.targetSentence || currentQ.words?.join(' '))}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm"
                                  >
                                    Tách Từ Tự Động
                                  </button>
                                </div>
                              </div>

                              {/* Words chips */}
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-600">
                                  Các ô từ đúng (Theo thứ tự ghép):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {currentQ.words?.map((w, wIdx) => (
                                    <span key={wIdx} className="px-3 py-1.5 bg-white border-2 border-emerald-400 text-emerald-900 rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5">
                                      <span>{w}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextWords = currentQ.words.filter((_, idx) => idx !== wIdx);
                                          setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, words: nextWords, correctSequence: nextWords } : q));
                                        }}
                                        className="text-slate-400 hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Distractor words */}
                              <div className="space-y-2 pt-2 border-t border-emerald-200">
                                <label className="block text-xs font-bold text-slate-700">
                                  Các từ gây nhiễu (Thêm vào ngân hàng từ để thử thách):
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    id={`distractor-input-${currentQ.id}`}
                                    type="text"
                                    placeholder="Nhập từ gây nhiễu (VD: NGỦ, ĐI)..."
                                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.target;
                                        if (input.value.trim()) {
                                          const nextD = [...(currentQ.distractorWords || []), input.value.trim().toUpperCase()];
                                          setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, distractorWords: nextD } : q));
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const input = document.getElementById(`distractor-input-${currentQ.id}`);
                                      if (input && input.value.trim()) {
                                        const nextD = [...(currentQ.distractorWords || []), input.value.trim().toUpperCase()];
                                        setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, distractorWords: nextD } : q));
                                        input.value = '';
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                                  >
                                    + Thêm từ nhiễu
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                  {currentQ.distractorWords?.map((dw, dwIdx) => (
                                    <span key={dwIdx} className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                      <span>{dw}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextD = currentQ.distractorWords.filter((_, idx) => idx !== dwIdx);
                                          setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, distractorWords: nextD } : q));
                                        }}
                                        className="text-slate-400 hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. IMAGE SELECTION FORM (KIDS MODE) */}
                          {currentQ.type === 'image-selection' && (
                            <div className="space-y-4 pt-2">
                              {/* Target word & spelling */}
                              <div className="flex flex-col sm:flex-row gap-3 bg-purple-50/70 p-3 rounded-2xl border border-purple-200">
                                <div className="flex-1">
                                  <label className="block text-xs font-black text-purple-800 mb-1">
                                    Từ cần đánh vần khi bé đoán đúng (VD: NHÀ, ĂN, NGỦ, BA, MẸ)
                                  </label>
                                  <input
                                    type="text"
                                    value={currentQ.targetWord || ''}
                                    onChange={(e) => {
                                      const val = e.target.value.toUpperCase();
                                      setQuestions(prev => prev.map(q => q.id === currentQ.id ? { 
                                        ...q, 
                                        targetWord: val, 
                                        letters: val.split('') 
                                      } : q));
                                    }}
                                    placeholder="NHÀ"
                                    className="w-full px-3.5 py-2 rounded-xl border border-purple-300 font-black text-sm bg-white text-purple-900"
                                  />
                                </div>
                                <div className="self-center">
                                  <span className="text-xs font-black text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-sm inline-block">
                                    Tách chữ cái: {currentQ.letters?.join(' – ')}
                                  </span>
                                </div>
                              </div>

                              {/* Question demonstration image */}
                              <div>
                                <label className="block text-xs font-black text-slate-500 mb-1">
                                  Ảnh/Video minh họa ký hiệu mẫu của câu hỏi
                                </label>
                                <input
                                  type="text"
                                  value={currentQ.questionImage || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, questionImage: val } : q));
                                  }}
                                  placeholder="URL ảnh ký hiệu..."
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                                />
                              </div>

                              {/* 4 Image Options */}
                              <div className="space-y-2">
                                <span className="text-xs font-black uppercase text-slate-500">
                                  4 Hình Ảnh Lựa Chọn Cho Bé:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {currentQ.answerOptions?.map((opt, optIdx) => (
                                    <div 
                                      key={opt.id} 
                                      className={`p-3 rounded-2xl border-2 space-y-2 bg-white ${
                                        (opt.id === currentQ.correctAnswer || opt.isCorrect) 
                                          ? 'border-emerald-500 bg-emerald-50/40' 
                                          : 'border-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`correct-img-${currentQ.id}`}
                                            checked={opt.id === currentQ.correctAnswer || opt.isCorrect}
                                            onChange={() => {
                                              const updated = currentQ.answerOptions.map(o => ({
                                                ...o,
                                                isCorrect: o.id === opt.id
                                              }));
                                              setQuestions(prev => prev.map(q => q.id === currentQ.id ? {
                                                ...q,
                                                answerOptions: updated,
                                                correctAnswer: opt.id
                                              } : q));
                                            }}
                                          />
                                          <span className="text-xs font-black text-slate-700">
                                            Hình {optIdx + 1} {(opt.id === currentQ.correctAnswer || opt.isCorrect) ? '(Đáp án ĐÚNG)' : ''}
                                          </span>
                                        </label>
                                      </div>

                                      <input
                                        type="text"
                                        placeholder="Tên nhãn (VD: Ngôi nhà)..."
                                        value={opt.label || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updated = currentQ.answerOptions.map(o => o.id === opt.id ? { ...o, label: val } : o);
                                          setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, answerOptions: updated } : q));
                                        }}
                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                                      />

                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="URL ảnh..."
                                          value={opt.imageUrl || ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const updated = currentQ.answerOptions.map(o => o.id === opt.id ? { ...o, imageUrl: val } : o);
                                            setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, answerOptions: updated } : q));
                                          }}
                                          className="flex-1 px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-mono"
                                        />
                                        <label className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-[11px] rounded-xl cursor-pointer flex items-center">
                                          <span>Upload</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              if (e.target.files?.[0]) handleUploadOptionImage(currentQ.id, opt.id, e.target.files[0]);
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. MULTIPLE CHOICE FORM */}
                          {currentQ.type === 'multiple-choice' && (
                            <div className="space-y-2">
                              <span className="text-xs font-black uppercase text-slate-500">Các Lựa Chọn Đáp Án:</span>
                              {currentQ.answerOptions?.map((opt) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${currentQ.id}`}
                                    checked={opt.id === currentQ.correctAnswer || opt.isCorrect}
                                    onChange={() => {
                                      const updatedOptions = currentQ.answerOptions.map(o => ({ ...o, isCorrect: o.id === opt.id }));
                                      setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, answerOptions: updatedOptions, correctAnswer: opt.id } : q));
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedOptions = currentQ.answerOptions.map(o => o.id === opt.id ? { ...o, text: val } : o);
                                      setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, answerOptions: updatedOptions } : q));
                                    }}
                                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 5. TRUE / FALSE FORM */}
                          {currentQ.type === 'true-false' && (
                            <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                              <span className="text-xs font-bold text-slate-600">Đáp án chính xác:</span>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 font-black text-sm text-emerald-600 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`tf-${currentQ.id}`}
                                    checked={String(currentQ.correctAnswer) === 'true'}
                                    onChange={() => {
                                      setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, correctAnswer: 'true' } : q));
                                    }}
                                  />
                                  <span>ĐÚNG</span>
                                </label>
                                <label className="flex items-center gap-2 font-black text-sm text-red-600 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`tf-${currentQ.id}`}
                                    checked={String(currentQ.correctAnswer) === 'false'}
                                    onChange={() => {
                                      setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, correctAnswer: 'false' } : q));
                                    }}
                                  />
                                  <span>SAI</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Explanations & Feedback Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="block text-[11px] font-bold text-emerald-700 mb-1">
                                Phản hồi khi trả lời ĐÚNG
                              </label>
                              <input
                                type="text"
                                placeholder="Phản hồi khi trả lời ĐÚNG..."
                                value={currentQ.correctFeedback || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, correctFeedback: val } : q));
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-red-700 mb-1">
                                Phản hồi khi trả lời SAI
                              </label>
                              <input
                                type="text"
                                placeholder="Phản hồi khi trả lời SAI..."
                                value={currentQ.incorrectFeedback || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, incorrectFeedback: val } : q));
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-bold"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                Lời giải thích / Gợi ý đáp án
                              </label>
                              <input
                                type="text"
                                placeholder="Lời giải thích / gợi ý..."
                                value={currentQ.explanation || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions(prev => prev.map(q => q.id === currentQ.id ? { ...q, explanation: val } : q));
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessonBuilder;
