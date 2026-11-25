import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  Save,
  Trash2,
  Edit3,
  X,
  Loader2,
  Upload,
  Sparkles,
  Video,
} from 'lucide-react';
import { getStories } from '../../services/dbService';
import {
  getStorySentences,
  saveStorySentenceAdmin,
  deleteStorySentenceAdmin,
  seedTamCamMirrorSentences,
} from '../../services/mirrorService';
import { uploadMediaToCloudinary } from '../../services/cloudinaryService';
import { useSound } from '../../context/SoundContext';

export const AdminSignMirrorManager = () => {
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [stories, setStories] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let active = true;
    getStories().then((list) => {
      if (!active) return;
      setStories(list);
      if (list.length > 0) {
        setSelectedStoryId(list[0].id);
      } else {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedStoryId) return;
    let active = true;
    getStorySentences(selectedStoryId).then((list) => {
      if (!active) return;
      setSentences(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selectedStoryId]);

  const reloadSentences = async () => {
    if (!selectedStoryId) return;
    setLoading(true);
    const list = await getStorySentences(selectedStoryId);
    setSentences(list);
    setLoading(false);
  };

  const handleNewSentence = () => {
    playClick();
    setForm({
      id: `sentence-${Date.now()}`,
      storyId: selectedStoryId,
      order: sentences.length + 1,
      sentenceText: '',
      signVideos: [
        {
          signId: `sign-${Date.now()}`,
          signName: '',
          videoUrl: '',
          description: '',
          order: 1,
        },
      ],
    });
  };

  const handleEditSentence = (s) => {
    playClick();
    setForm({
      ...s,
      signVideos: s.signVideos?.length
        ? s.signVideos.map((v) => ({ ...v }))
        : [{ signId: `sign-${Date.now()}`, signName: '', videoUrl: '', description: '', order: 1 }],
    });
  };

  const handleAddSignSlot = () => {
    setForm((prev) => ({
      ...prev,
      signVideos: [
        ...(prev.signVideos || []),
        {
          signId: `sign-${Date.now()}`,
          signName: '',
          videoUrl: '',
          description: '',
          order: (prev.signVideos?.length || 0) + 1,
        },
      ],
    }));
  };

  const handleRemoveSignSlot = (idx) => {
    setForm((prev) => ({
      ...prev,
      signVideos: prev.signVideos.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateSignField = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      signVideos: prev.signVideos.map((sv, i) => (i === idx ? { ...sv, [field]: value } : sv)),
    }));
  };

  const handleUploadSignVideo = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await uploadMediaToCloudinary(file);
      playCorrect();
      handleUpdateSignField(idx, 'videoUrl', res.url);
    } catch (err) {
      playIncorrect();
      alert('Lỗi upload video: ' + err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSave = async () => {
    if (!form?.sentenceText?.trim()) {
      alert('Vui lòng nhập nội dung câu.');
      return;
    }
    setSaving(true);
    try {
      await saveStorySentenceAdmin({ ...form, storyId: selectedStoryId });
      playCorrect();
      setForm(null);
      await reloadSentences();
    } catch (err) {
      playIncorrect();
      alert('Lỗi lưu câu SIGN MIRROR: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa câu luyện tập SIGN MIRROR này?')) return;
    playClick();
    await deleteStorySentenceAdmin(id);
    await reloadSentences();
  };

  const handleSeedTamCam = async () => {
    setSaving(true);
    await seedTamCamMirrorSentences();
    await reloadSentences();
    setSaving(false);
    alert('Đã nạp dữ liệu mẫu SIGN MIRROR cho truyện Tấm Cám!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" />
            <span>Quản Lý SIGN MIRROR Theo Câu Chuyện</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Thiết lập từng câu thoại và video ký hiệu mẫu cho chế độ luyện tập qua gương.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeedTamCam}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nạp mẫu Tấm Cám</span>
          </button>
          <button
            onClick={handleNewSentence}
            disabled={!selectedStoryId}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Mới</span>
          </button>
        </div>
      </div>

      {/* Story Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-black uppercase text-slate-500">Chọn câu chuyện:</label>
        <select
          value={selectedStoryId}
          onChange={(e) => {
            setForm(null);
            setSelectedStoryId(e.target.value);
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white min-w-[240px]"
        >
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Edit/Create Form */}
      {form && (
        <div className="bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-slate-800">Biên tập câu luyện tập SIGN MIRROR</h2>
            <button onClick={() => setForm(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-black text-slate-600 mb-1">Nội dung câu trong truyện *</label>
              <input
                value={form.sentenceText}
                onChange={(e) => setForm((p) => ({ ...p, sentenceText: e.target.value }))}
                placeholder="VD: Tấm sống cùng dì ghẻ và Cám."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">Thứ tự câu</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Các ký hiệu mẫu trong câu</span>
              <button
                type="button"
                onClick={handleAddSignSlot}
                className="text-xs font-black text-purple-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm ký hiệu
              </button>
            </div>

            {form.signVideos.map((sv, idx) => (
              <div key={sv.signId || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-purple-700">Ký hiệu #{idx + 1}</span>
                  {form.signVideos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSignSlot(idx)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={sv.signName}
                    onChange={(e) => handleUpdateSignField(idx, 'signName', e.target.value)}
                    placeholder="Tên ký hiệu (VD: Ngôi nhà)"
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                  />
                  <div className="flex gap-2">
                    <input
                      value={sv.videoUrl}
                      onChange={(e) => handleUpdateSignField(idx, 'videoUrl', e.target.value)}
                      placeholder="URL video ký hiệu..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                    <label className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0">
                      {uploadingIdx === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Tải video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={uploadingIdx === idx}
                        onChange={(e) => e.target.files?.[0] && handleUploadSignVideo(idx, e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
                <input
                  value={sv.description}
                  onChange={(e) => handleUpdateSignField(idx, 'description', e.target.value)}
                  placeholder="Mô tả ngắn cách thực hiện..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setForm(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu Câu Luyện Tập</span>
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : sentences.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
          <p className="font-black text-slate-700">Chưa có câu nào cho truyện này</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sentences.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-black text-purple-600">Câu #{s.order}</span>
                <p className="font-black text-slate-800 text-base">“{s.sentenceText}”</p>
                <div className="flex flex-wrap gap-2">
                  {(s.signVideos || []).map((sv, i) => (
                    <span
                      key={sv.signId || i}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100"
                    >
                      <Video className="w-3 h-3" /> {sv.signName || 'Ký hiệu'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleEditSentence(s)}
                  className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSignMirrorManager;
