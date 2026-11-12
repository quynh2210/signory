import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Baby, 
  Heart, 
  CheckCircle2, 
  Play, 
  Star, 
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export const HomePage = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { playClick } = useSound();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-14 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-800 text-sm font-black border border-brand-200 shadow-sm animate-bounce-slow">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Nền tảng học ngôn ngữ ký hiệu cùng truyện tranh</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-850 tracking-tight leading-tight">
              Học Ngôn Ngữ Ký Hiệu <br />
              <span className="text-brand-500 underline decoration-yellow-400 decoration-wavy decoration-2">
                Gắn Kết Gia Đình
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 font-semibold max-w-xl mx-auto lg:mx-0 leading-relaxed">
              SIGNORY đồng hành cùng cuốn sách truyện tranh thiếu nhi, giúp phụ huynh và các bé cùng học ký hiệu, ghi nhớ ý nghĩa và làm quen mặt chữ qua các trò chơi tương tác vui nhộn kiểu Duolingo!
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/parents"
                onClick={playClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg text-white btn-3d btn-green-3d flex items-center justify-center gap-2 shadow-lg"
              >
                <Users className="w-6 h-6" />
                <span>Bắt Đầu Học (Phụ Huynh)</span>
              </Link>

              <Link
                to="/kids"
                onClick={playClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg text-white btn-3d btn-purple-3d flex items-center justify-center gap-2 shadow-lg"
              >
                <Baby className="w-6 h-6" />
                <span>Chế Độ Bé Vui Học</span>
              </Link>
            </div>

            {!user && (
              <p className="text-xs text-slate-400 font-bold">
                Hoàn toàn miễn phí • Không chứa quảng cáo • Bảo vệ thông tin trẻ em
              </p>
            )}
          </div>

          {/* Right Visual Card */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-white rounded-[36px] p-6 shadow-2xl border-4 border-slate-100 relative">
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-950 font-black px-4 py-1.5 rounded-2xl shadow-duo text-sm rotate-6">
                Chỉ 3 phút / ngày!
              </div>

              {/* Sample sign preview */}
              <div className="rounded-3xl overflow-hidden border-2 border-slate-100 bg-emerald-50 p-4 text-center space-y-3">
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-emerald-100">
                  <img 
                    src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&auto=format&fit=crop&q=80" 
                    alt="Ký hiệu Nhà" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="text-left">
                    <span className="text-xs font-black uppercase text-brand-600">Bài 1: Ở nhà</span>
                    <h4 className="text-xl font-black text-slate-800">Ký hiệu: NHÀ</h4>
                  </div>
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
              </div>

              {/* Interactive Preview Chips */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl">🏠</span>
                  <p className="text-xs font-black text-slate-700 mt-1">Nhà</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl">🍚</span>
                  <p className="text-xs font-black text-slate-700 mt-1">Ăn</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl">😴</span>
                  <p className="text-xs font-black text-slate-700 mt-1">Ngủ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Modes Explanation */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800">
            Hai Trải Nghiệm Học Tập Chuyên Biệt
          </h2>
          <p className="text-slate-600 font-bold max-w-2xl mx-auto">
            SIGNORY thiết kế riêng biệt cho cả phụ huynh và các bé để tối ưu hóa sự tiếp thu tự nhiên nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Parents Mode Card */}
          <div className="bg-white rounded-[32px] p-8 border-2 border-brand-200 shadow-md space-y-6 hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
              <Users className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Chế Độ Phụ Huynh</h3>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Dành cho cha mẹ, anh chị và người thân muốn nắm vững ký hiệu để giao tiếp, thủ thỉ và đọc truyện tranh cùng con.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm font-bold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span>Bản đồ bài học từng chặng nối tiếp kiểu Duolingo.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span>Mỗi bài học 3 ký hiệu, chỉ mất 3 phút dễ dàng duy trì.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span>Video chuyển động chậm, mẹo ghi nhớ gắn liền truyện tranh.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span>Câu hỏi đa dạng: Ghép câu, trắc nghiệm, nối cặp, nhận diện.</span>
              </li>
            </ul>

            <Link
              to="/parents"
              onClick={playClick}
              className="inline-flex items-center gap-2 text-brand-600 font-black text-base group-hover:translate-x-1 transition-transform"
            >
              <span>Khám phá bản đồ học tập</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>
          </div>

          {/* Kids Mode Card */}
          <div className="bg-white rounded-[32px] p-8 border-2 border-purple-200 shadow-md space-y-6 hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-duo-purpleDark flex items-center justify-center shadow-sm">
              <Baby className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Chế Độ Bé Yêu</h3>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Giao diện ngập tràn màu sắc, nút bấm to bự, phản hồi tích cực và đánh vần từng chữ cái giúp bé vui chơi không áp lực.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm font-bold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-duo-purpleDark shrink-0" />
                <span>4 hình ảnh to rõ, sinh động để bé dễ chạm chọn.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-duo-purpleDark shrink-0" />
                <span>Đánh vần từng chữ cái: N - H - À khi bé đoán đúng!</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-duo-purpleDark shrink-0" />
                <span>Âm thanh vui tươi, không phạt điểm khi chọn sai.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-duo-purpleDark shrink-0" />
                <span>Mỗi lượt chơi 5 câu, nhận 3 ngôi sao lấp lánh và huy hiệu.</span>
              </li>
            </ul>

            <Link
              to="/kids"
              onClick={playClick}
              className="inline-flex items-center gap-2 text-duo-purpleDark font-black text-base group-hover:translate-x-1 transition-transform"
            >
              <span>Cùng bé chơi ngay</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-[36px] p-8 md:p-12 text-white shadow-xl">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Tại sao nên học Ngôn ngữ Ký hiệu cùng con?
            </h2>
            <p className="text-base md:text-lg font-medium opacity-90 leading-relaxed">
              Ngôn ngữ ký hiệu không chỉ là cầu nối ngôn ngữ mà còn kích thích phát triển não bộ, tăng khả năng biểu đạt cảm xúc và tạo nên sự gắn kết yêu thương sâu sắc giữa cha mẹ và con trẻ.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-2xl font-black">3 phút</p>
                <p className="text-sm font-semibold opacity-90">Thời gian lý tưởng mỗi ngày</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-2xl font-black">7 Dạng</p>
                <p className="text-sm font-semibold opacity-90">Câu hỏi tương tác vui nhộn</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-2xl font-black">100%</p>
                <p className="text-sm font-semibold opacity-90">An toàn & bảo vệ trẻ em</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
