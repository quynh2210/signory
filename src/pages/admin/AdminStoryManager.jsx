import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Plus, Trash2, Edit3, Save, X, ChevronRight,
  Loader2, Sparkles, Image as ImageIcon, Upload, GripVertical,
  Layers, BookMarked, ArrowLeft, Lock, Unlock
} from 'lucide-react';
import {
  getStories, saveStory, deleteStory,
  getChapters, saveChapter, deleteChapter,
  getLessonsByChapter, getLessons, saveLessonAdmin,
  seedTamCamStory
} from '../../services/dbService';
import { uploadMediaToCloudinary } from '../../services/cloudinaryService';
import { useSound } from '../../context/SoundContext';

const genId = (prefix) => `${prefix}-${Date.now()}`;

export const AdminStoryManager = () => {
  const { playClick, playCorrect } = useSound();

  // --- Stories ---
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  // --- Chapters ---
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // --- Lessons ---
  const [allLessons, setAllLessons] = useState([]);
  const [chapterLessons, setChapterLessons] = useState([]);

  // --- Loading / UI state ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // --- Edit forms ---
  const [storyForm, setStoryForm] = useState(null); // null = not editing
  const [chapterForm, setChapterForm] = useState(null);

  const coverInputRef = useRef(null);

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    const data = await getStories();
    setStories(data);
    const ls = await getLessons();
    setAllLessons(ls);
    setLoading(false);
  };

  const loadChapters = async (storyId) => {
    setLoading(true);
    const data = await getChapters(storyId);
    setChapters(data);
    setSelectedChapter(null);
    setChapterLessons([]);
    setLoading(false);
  };

  const loadChapterLessons = async (chapterId) => {
    const lessons = await getLessonsByChapter(chapterId);
    setChapterLessons(lessons);
  };

  // --- Story CRUD ---
  const handleSelectStory = async (story) => {
    playClick();
    setSelectedStory(story);
    setStoryForm(null);
    setChapterForm(null);
    await loadChapters(story.id);
  };

  const handleNewStory = () => {
    playClick();
    setStoryForm({ id: genId('story'), title: '', description: '', coverImage: '', order: stories.length + 1, isPublished: true });
  };

  const handleEditStory = (story) => {
    playClick();
    setStoryForm({ ...story });
  };

  const handleSaveStory = async () => {
    if (!storyForm?.title.trim()) return alert('Vui lòng nhập tên câu chuyện.');
    setSaving(true);
    try {
      await saveStory(storyForm);
      playCorrect();
      setStoryForm(null);
      await loadStories();
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu câu chuyện: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Xóa câu chuyện này sẽ xóa tất cả chương liên quan. Tiếp tục?')) return;
    playClick();
    await deleteStory(storyId);
    if (selectedStory?.id === storyId) {
      setSelectedStory(null);
      setChapters([]);
    }
    await loadStories();
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadMediaToCloudinary(file);
      setStoryForm(prev => ({ ...prev, coverImage: res.url }));
    } catch (e) {
      alert('Lỗi upload ảnh bìa: ' + e.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // --- Chapter CRUD ---
  const handleSelectChapter = async (chapter) => {
    playClick();
    setSelectedChapter(chapter);
    setChapterForm(null);
    await loadChapterLessons(chapter.id);
  };

  const handleNewChapter = () => {
    playClick();
    if (!selectedStory) return alert('Hãy chọn câu chuyện trước.');
    setChapterForm({ 
      id: genId('chapter'), 
      storyId: selectedStory.id, 
      title: '', 
      description: '', 
      order: chapters.length + 1, 
      isPublished: true,
      isLockedByDefault: chapters.length > 0
    });
  };

  const handleEditChapter = (chapter) => {
    playClick();
    setChapterForm({ ...chapter });
  };

  const handleToggleChapterLock = async (chapter) => {
    setSaving(true);
    try {
      const updated = { ...chapter, isLockedByDefault: !chapter.isLockedByDefault };
      await saveChapter(updated);
      playCorrect();
      if (selectedStory) await loadChapters(selectedStory.id);
    } catch (err) {
      alert('Lỗi cập nhật trạng thái khóa: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLessonLock = async (lesson) => {
    setSaving(true);
    try {
      const updated = { ...lesson, isLockedByDefault: !lesson.isLockedByDefault };
      await saveLessonAdmin(updated);
      playCorrect();
      if (selectedChapter) await loadChapterLessons(selectedChapter.id);
      const ls = await getLessons();
      setAllLessons(ls);
    } catch (err) {
      alert('Lỗi cập nhật trạng thái khóa bài học: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChapter = async () => {
    if (!chapterForm?.title.trim()) return alert('Vui lòng nhập tên chương.');
    setSaving(true);
    try {
      await saveChapter(chapterForm);
      playCorrect();
      setChapterForm(null);
      await loadChapters(selectedStory.id);
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu chương: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Xóa chương này? Các bài học sẽ không bị xóa nhưng sẽ mất liên kết với chương.')) return;
    await deleteChapter(chapterId);
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(null);
      setChapterLessons([]);
    }
    await loadChapters(selectedStory.id);
  };

  // --- Assign lesson to chapter ---
  const handleAssignLesson = async (lessonId, chapterId) => {
    const lesson = allLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    setSaving(true);
    await saveLessonAdmin({
      ...lesson,
      chapterId,
      storyId: selectedStory?.id || lesson.storyId,
    });
    if (selectedChapter) await loadChapterLessons(selectedChapter.id);
    const ls = await getLessons();
    setAllLessons(ls);
    setSaving(false);
  };

  const handleRemoveLessonFromChapter = async (lesson) => {
    setSaving(true);
    await saveLessonAdmin({ ...lesson, chapterId: null });
    if (selectedChapter) await loadChapterLessons(selectedChapter.id);
    const ls = await getLessons();
    setAllLessons(ls);
    setSaving(false);
  };

  // --- Seed ---
  const handleSeed = async () => {
    if (!window.confirm('Tạo dữ liệu mẫu "Tấm Cám"? Các dữ liệu cũ cùng ID sẽ bị ghi đè.')) return;
    setSeeding(true);
    try {
      await seedTamCamStory();
      await loadStories();
      alert('Đã tạo câu chuyện Tấm Cám mẫu!');
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const unassignedLessons = allLessons.filter(l => !l.chapterId || l.chapterId === '' || l.chapterId === null);

  if (loading && stories.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" /> Quản Lý Câu Chuyện & Chương
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">Tổ chức bài học theo Câu Chuyện → Chương → Bài Học</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-sm transition-all disabled:opacity-60"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Tạo Mẫu Tấm Cám
          </button>
          <button
            onClick={handleNewStory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm Câu Chuyện
          </button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Column 1: Stories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-black text-purple-800 text-sm flex items-center gap-2"><BookMarked className="w-4 h-4" /> Câu Chuyện</h2>
            <span className="text-xs font-bold text-slate-400">{stories.length} truyện</span>
          </div>

          {/* Story Form */}
          {storyForm && (
            <div className="p-4 border-b border-slate-200 bg-purple-50/50 space-y-3">
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Tên câu chuyện *</label>
                <input
                  value={storyForm.title}
                  onChange={e => setStoryForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="VD: Tấm Cám"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Mô tả</label>
                <textarea
                  value={storyForm.description}
                  onChange={e => setStoryForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Ảnh bìa</label>
                <div className="flex gap-2">
                  <input
                    value={storyForm.coverImage}
                    onChange={e => setStoryForm(p => ({ ...p, coverImage: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="URL ảnh hoặc upload..."
                  />
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleCoverUpload(e.target.files[0])} />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1 disabled:opacity-60"
                  >
                    {uploadingCover ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  </button>
                </div>
                {storyForm.coverImage && (
                  <img src={storyForm.coverImage} alt="preview" className="mt-2 w-full h-20 object-cover rounded-xl" onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={storyForm.order}
                  onChange={e => setStoryForm(p => ({ ...p, order: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="storyPublished" checked={storyForm.isPublished}
                  onChange={e => setStoryForm(p => ({ ...p, isPublished: e.target.checked }))} />
                <label htmlFor="storyPublished" className="text-xs font-black text-slate-600">Công khai</label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveStory} disabled={saving}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-60">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Lưu
                </button>
                <button onClick={() => setStoryForm(null)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {stories.length === 0 && !storyForm && (
              <p className="text-center py-8 text-sm text-slate-400 font-semibold">Chưa có câu chuyện nào</p>
            )}
            {stories.map(story => (
              <div
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-purple-50 transition-colors ${selectedStory?.id === story.id ? 'bg-purple-100 border-l-4 border-purple-600' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={story.coverImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100'} alt={story.title} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{story.title}</p>
                  <p className="text-xs text-slate-400 font-semibold">{story.isPublished ? '✅ Công khai' : '🔒 Ẩn'}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); handleEditStory(story); }}
                    className="p-1.5 hover:bg-purple-200 text-purple-600 rounded-lg transition-all">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteStory(story.id); }}
                    className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Chapters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-pink-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-black text-pink-800 text-sm flex items-center gap-2"><Layers className="w-4 h-4" /> Chương</h2>
            {selectedStory && (
              <button onClick={handleNewChapter} className="text-xs font-black text-pink-700 hover:text-pink-900 flex items-center gap-1 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            )}
          </div>

          {!selectedStory ? (
            <p className="text-center py-10 text-sm text-slate-400 font-semibold">← Chọn câu chuyện</p>
          ) : (
            <>
              {/* Chapter Form */}
              {chapterForm && (
                <div className="p-4 border-b border-slate-200 bg-pink-50/50 space-y-3">
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">Tên chương *</label>
                    <input
                      value={chapterForm.title}
                      onChange={e => setChapterForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="VD: Khởi Đầu Câu Chuyện"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">Mô tả</label>
                    <textarea
                      value={chapterForm.description}
                      onChange={e => setChapterForm(p => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">Thứ tự</label>
                    <input
                      type="number"
                      value={chapterForm.order}
                      onChange={e => setChapterForm(p => ({ ...p, order: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="chapterPublished" checked={chapterForm.isPublished}
                        onChange={e => setChapterForm(p => ({ ...p, isPublished: e.target.checked }))} />
                      <label htmlFor="chapterPublished" className="text-xs font-black text-slate-600">Công khai</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="chapterLocked" checked={chapterForm.isLockedByDefault || false}
                        onChange={e => setChapterForm(p => ({ ...p, isLockedByDefault: e.target.checked }))} />
                      <label htmlFor="chapterLocked" className="text-xs font-black text-amber-700 flex items-center gap-1 cursor-pointer">
                        <Lock className="w-3 h-3" /> Khóa mặc định (Cần học xong chương trước)
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveChapter} disabled={saving}
                      className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-60">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Lưu
                    </button>
                    <button onClick={() => setChapterForm(null)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {chapters.length === 0 && !chapterForm && (
                  <p className="text-center py-8 text-sm text-slate-400 font-semibold">Chưa có chương nào</p>
                )}
                {chapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-pink-50 transition-colors ${selectedChapter?.id === ch.id ? 'bg-pink-100 border-l-4 border-pink-500' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm truncate">{ch.title}</p>
                      <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                        <span>{ch.isPublished ? '✅ Công khai' : '🔒 Ẩn'}</span>
                        <span className={ch.isLockedByDefault ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {ch.isLockedByDefault ? '• 🔒 Khóa theo tiến độ' : '• 🔓 Mở tự do'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={e => { e.stopPropagation(); handleToggleChapterLock(ch); }}
                        className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                          ch.isLockedByDefault 
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                        title={ch.isLockedByDefault ? 'Đang khóa mặc định (Bấm để mở tự do)' : 'Đang mở (Bấm để khóa theo tiến độ)'}
                      >
                        {ch.isLockedByDefault ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleEditChapter(ch); }}
                        className="p-1.5 hover:bg-pink-200 text-pink-600 rounded-lg transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDeleteChapter(ch.id); }}
                        className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Column 3: Lessons in Chapter */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-slate-200">
            <h2 className="font-black text-blue-800 text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Bài Học Trong Chương</h2>
          </div>

          {!selectedChapter ? (
            <p className="text-center py-10 text-sm text-slate-400 font-semibold">← Chọn chương</p>
          ) : (
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {/* Assigned lessons */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Bài học trong chương ({chapterLessons.length})</h3>
                {chapterLessons.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-3 text-center">Chưa có bài học</p>
                ) : (
                  <div className="space-y-2">
                    {chapterLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-sm font-black text-slate-700 flex-1 truncate">{lesson.title}</span>
                        <button
                          onClick={() => handleToggleLessonLock(lesson)}
                          disabled={saving}
                          className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold shrink-0 ${
                            lesson.isLockedByDefault
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                          title={lesson.isLockedByDefault ? 'Đang khóa (Bấm để mở tự do)' : 'Đang mở (Bấm để khóa theo tiến độ)'}
                        >
                          {lesson.isLockedByDefault ? (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveLessonFromChapter(lesson)}
                          disabled={saving}
                          className="p-1 hover:bg-red-100 text-red-400 rounded-lg transition-all shrink-0"
                          title="Gỡ khỏi chương"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unassigned lessons pool */}
              {unassignedLessons.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Thêm bài học chưa gán ({unassignedLessons.length})</h3>
                  <div className="space-y-2">
                    {unassignedLessons.slice(0, 10).map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold text-slate-600 flex-1 truncate">{lesson.title}</span>
                        <button
                          onClick={() => handleAssignLesson(lesson.id, selectedChapter.id)}
                          disabled={saving}
                          className="p-1 hover:bg-blue-100 text-blue-500 rounded-lg transition-all shrink-0"
                          title="Thêm vào chương"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {unassignedLessons.length > 10 && (
                      <p className="text-xs text-slate-400 font-semibold text-center">... và {unassignedLessons.length - 10} bài khác</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <a href="/admin/builder" className="text-xs font-black text-purple-600 hover:underline">+ Tạo bài học mới trong Admin Builder →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStoryManager;
