import React, { useState, useEffect } from 'react';
import { Heart, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import {
  getKindnessCards,
  toggleKindnessCardVisibilityAdmin,
  deleteKindnessCard,
} from '../../services/kindnessService';

export const AdminKindnessManager = () => {
  const { user } = useAuth();
  const { playClick, playCorrect } = useSound();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCards = async () => {
    setLoading(true);
    const list = await getKindnessCards({ includeHidden: true });
    setCards(list);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    getKindnessCards({ includeHidden: true }).then((list) => {
      if (!active) return;
      setCards(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleHide = async (card) => {
    const hide = card.status !== 'hidden';
    if (!window.confirm(hide ? 'Ẩn tấm thiệp này khỏi Bức Tường?' : 'Khôi phục hiển thị tấm thiệp này?')) {
      return;
    }
    playClick();
    await toggleKindnessCardVisibilityAdmin({
      cardId: card.id,
      hide,
      adminUid: user.uid,
      reason: hide ? 'Ẩn bởi Admin' : 'Khôi phục bởi Admin',
    });
    playCorrect();
    await loadCards();
  };

  const handleDelete = async (card) => {
    if (!window.confirm(`Xác nhận XÓA VĨNH VIỄN tấm thiệp của "${card.displayName}"?`)) return;
    playClick();
    await deleteKindnessCard({
      cardId: card.id,
      actorUid: user.uid,
      isAdmin: true,
      reason: 'Xóa thiệp không phù hợp',
    });
    playCorrect();
    await loadCards();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span>Kiểm Duyệt Wall of Kindness</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Xem toàn bộ thiệp yêu thương, ẩn/khôi phục hoặc xóa nội dung không phù hợp.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
          <p className="font-bold text-slate-500">Chưa có tấm thiệp nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 ${
                card.status === 'hidden' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800">{card.displayName}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {card.topic}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {card.theme}
                    </span>
                    {card.status === 'hidden' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        ĐÃ ẨN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    UID: {card.uid} • {card.createdAt ? new Date(card.createdAt).toLocaleString('vi-VN') : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleHide(card)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 ${
                      card.status === 'hidden'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {card.status === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{card.status === 'hidden' ? 'Khôi phục' : 'Ẩn'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(card)}
                    className="p-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
                    title="Xóa thiệp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 font-medium whitespace-pre-line">“{card.message}”</p>

              {card.mediaUrl && (
                <img
                  src={card.mediaUrl}
                  alt={card.displayName}
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminKindnessManager;
