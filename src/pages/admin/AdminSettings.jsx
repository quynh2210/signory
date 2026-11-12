import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Volume2, 
  Database, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  UploadCloud,
  RotateCcw,
  Music
} from 'lucide-react';
import { getAppSettings, saveAppSettings, seedInitialDataToFirestore } from '../../services/dbService';
import { uploadMediaToCloudinary } from '../../services/cloudinaryService';
import { useSound } from '../../context/SoundContext';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    soundEffects: true,
    defaultVolume: 0.7,
    dailyGoalExp: 30,
    questionsPerKidGame: 5,
    sampleDataNotice: 'Dữ liệu mẫu ban đầu phục vụ kiểm thử hệ thống.',
    soundCorrectUrl: '',
    soundIncorrectUrl: '',
    soundLetterUrl: '',
    soundBadgeUrl: '',
    soundCompleteUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const { 
    playCorrect, 
    playIncorrect, 
    playComplete, 
    playLetter, 
    playBadge, 
    playClick,
    updateCustomSounds 
  } = useSound();

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getAppSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    };
    fetchSettings();
  }, []);

  const handleUploadAudio = async (fieldName, file) => {
    if (!file) return;
    setUploadingField(fieldName);
    playClick();

    try {
      const result = await uploadMediaToCloudinary(file, () => {});
      playCorrect();
      setSettings(prev => ({ ...prev, [fieldName]: result.url }));
      setFeedbackMsg({ type: 'success', text: `Đã tải tệp âm thanh lên Cloudinary thành công!` });
    } catch (err) {
      playIncorrect();
      setFeedbackMsg({ type: 'error', text: `Upload âm thanh thất bại: ${err.message}` });
    } finally {
      setUploadingField(null);
    }
  };

  const handlePreviewAudio = (url, fallbackFn) => {
    if (url) {
      try {
        const audio = new Audio(url);
        audio.play().catch(() => fallbackFn());
      } catch (e) {
        fallbackFn();
      }
    } else {
      fallbackFn();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    playClick();

    const res = await saveAppSettings(settings);
    if (res.success) {
      // Update custom sounds in SoundContext
      updateCustomSounds({
        correct: settings.soundCorrectUrl || '',
        incorrect: settings.soundIncorrectUrl || '',
        letter: settings.soundLetterUrl || '',
        badge: settings.soundBadgeUrl || '',
        complete: settings.soundCompleteUrl || ''
      });
      playCorrect();
      setFeedbackMsg({ type: 'success', text: 'Đã lưu toàn bộ cài đặt & âm thanh hệ thống thành công!' });
    } else {
      playIncorrect();
      setFeedbackMsg({ type: 'error', text: 'Lưu cài đặt thất bại: ' + res.error });
    }
    setIsSaving(false);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Khởi tạo lại dữ liệu mẫu cho hệ thống? (Các bài học và câu hỏi mẫu sẽ được tải vào Firestore)')) return;
    setIsSeeding(true);
    playClick();

    const res = await seedInitialDataToFirestore(true);
    if (res.success) {
      playCorrect();
      setFeedbackMsg({ type: 'success', text: 'Đã nạp thành công toàn bộ dữ liệu mẫu ban đầu vào Firestore!' });
    } else {
      playIncorrect();
      setFeedbackMsg({ type: 'error', text: 'Lỗi nạp dữ liệu: ' + res.error });
    }
    setIsSeeding(false);
  };

  const audioConfigRows = [
    {
      field: 'soundCorrectUrl',
      title: 'Âm thanh Trả lời Đúng',
      desc: 'Phát khi người học hoặc bé chọn đúng đáp án.',
      testFn: () => handlePreviewAudio(settings.soundCorrectUrl, playCorrect)
    },
    {
      field: 'soundIncorrectUrl',
      title: 'Âm thanh Trả lời Sai',
      desc: 'Phát âm thanh nhẹ nhàng nhắc nhở khi chọn sai.',
      testFn: () => handlePreviewAudio(settings.soundIncorrectUrl, playIncorrect)
    },
    {
      field: 'soundLetterUrl',
      title: 'Âm thanh Hiện chữ cái (Chế độ Bé)',
      desc: 'Phát khi các chữ cái hoạt họa xuất hiện (ví dụ: N - H - À).',
      testFn: () => handlePreviewAudio(settings.soundLetterUrl, () => playLetter(2))
    },
    {
      field: 'soundBadgeUrl',
      title: 'Âm thanh Nhận Huy Hiệu',
      desc: 'Phát khi mở khóa danh hiệu thành tích mới.',
      testFn: () => handlePreviewAudio(settings.soundBadgeUrl, playBadge)
    },
    {
      field: 'soundCompleteUrl',
      title: 'Âm thanh Hoàn thành Bài học',
      desc: 'Khúc khải hoàn ăn mừng khi hoàn thành tất cả câu hỏi.',
      testFn: () => handlePreviewAudio(settings.soundCompleteUrl, playComplete)
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">Cài Đặt Hệ Thống & Quản Lý Âm Thanh</h1>
        <p className="text-sm font-semibold text-slate-500">
          Cấu hình quy tắc bài học cho bé, tùy chỉnh tệp âm thanh (upload / dán link) và kiểm thử
        </p>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 1. Default Sound Synthesizer Testing Box */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-slate-800">
          <Volume2 className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-black">Bộ Máy Âm Thanh Mặc Định (Web Audio API)</h3>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          SIGNORY tích hợp bộ máy tạo âm thanh kỹ thuật số chạy trực tiếp trên trình duyệt, không bao giờ bị phụ thuộc vào tệp ngoài hoặc lỗi đường truyền.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <button
            type="button"
            onClick={() => playCorrect()}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>Đúng (Chime)</span>
          </button>

          <button
            type="button"
            onClick={() => playIncorrect()}
            className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>Sai (Boing)</span>
          </button>

          <button
            type="button"
            onClick={() => playLetter(2)}
            className="p-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>Chữ cái (Pop)</span>
          </button>

          <button
            type="button"
            onClick={() => playBadge()}
            className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>Huy hiệu</span>
          </button>

          <button
            type="button"
            onClick={() => playComplete()}
            className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>Khúc khải hoàn</span>
          </button>
        </div>
      </div>

      {/* 2. Custom Audio Files Manager (Upload / Link) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-slate-800">
          <Music className="w-6 h-6 text-brand-600" />
          <div>
            <h3 className="text-lg font-black">Tùy Chỉnh Tệp Âm Thanh Riêng (Upload / Dán Link)</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Admin có thể tải lên tệp âm thanh MP3/WAV của riêng mình hoặc dán URL. Nếu để trống, hệ thống sẽ tự động dùng âm thanh mặc định.
            </p>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-slate-100">
          {audioConfigRows.map((row) => (
            <div key={row.field} className="pt-4 first:pt-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{row.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{row.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={row.testFn}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nghe thử</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Dán URL âm thanh (https://.../sound.mp3) hoặc tải file bên phải..."
                  value={settings[row.field] || ''}
                  onChange={(e) => setSettings({ ...settings, [row.field]: e.target.value })}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-purple-500"
                />

                <div className="flex gap-2">
                  <label className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 transition-all">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingField === row.field ? 'Đang tải...' : 'Upload Cloudinary'}</span>
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadAudio(row.field, e.target.files[0]);
                      }}
                    />
                  </label>

                  {settings[row.field] && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, [row.field]: '' })}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all"
                      title="Khôi phục về âm thanh mặc định"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Game Rules Configuration */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm space-y-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          <span>Cấu Hình Quy Tắc Trò Chơi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">
              Số câu hỏi mỗi lượt chơi (Chế độ Bé)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.questionsPerKidGame}
              onChange={(e) => setSettings({ ...settings, questionsPerKidGame: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Mặc định là 5 câu hỏi như trong tài liệu yêu cầu.
            </span>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">
              Mục tiêu EXP mặc định hằng ngày
            </label>
            <input
              type="number"
              value={settings.dailyGoalExp}
              onChange={(e) => setSettings({ ...settings, dailyGoalExp: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl font-black text-white btn-3d btn-purple-3d text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu Toàn Bộ Cài Đặt & Âm Thanh'}</span>
        </button>
      </form>

      {/* 4. Database Seeder Section */}
      <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <Database className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-black">Khởi Tạo Dữ Liệu Mẫu Ban Đầu (Database Seeder)</h3>
        </div>
        <p className="text-xs font-semibold text-amber-900 leading-relaxed">
          Tự động nạp các bài học mẫu chuẩn (cho cả Phụ huynh và Bé), ngân hàng câu hỏi và đầy đủ bộ huy hiệu vào hệ thống.
        </p>

        <button
          type="button"
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="px-5 py-2.5 rounded-xl font-black text-amber-900 bg-amber-200 hover:bg-amber-300 transition-all text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Đang nạp dữ liệu...' : 'Nạp Lại Dữ Liệu Mẫu Chuẩn'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
