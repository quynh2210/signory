import React from 'react';
import { Heart, ShieldCheck, Sparkles, Mail, Bot, BookOpen, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-slate-100 dark:border-slate-800 mt-16 text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Top row: branding + tagline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SIGNORY" className="w-9 h-9" />
            <div>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                SIGN<span className="text-amber-500 dark:text-yellow-400">ORY</span>
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Nền tảng học ngôn ngữ ký hiệu</p>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm text-left md:text-right leading-relaxed">
            Dự án giáo dục đồng hành cùng cuốn sách truyện tranh ký hiệu — kết nối gia đình qua ngôn ngữ của yêu thương.
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* About */}
          <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-slate-800 border border-brand-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-black text-sm">
              <BookOpen className="w-4 h-4" />
              Về SIGNORY
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              SIGNORY được thiết kế để phụ huynh, anh chị em và trẻ nhỏ cùng học ngôn ngữ ký hiệu tự nhiên thông qua các bài học tương tác và trò chơi vui nhộn, lấy cảm hứng từ Duolingo.
            </p>
          </div>

          {/* AI Notice */}
          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-black text-sm">
              <Bot className="w-4 h-4" />
              Hỗ trợ bởi AI
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Nền tảng này có tích hợp công nghệ AI hỗ trợ trong quá trình xây dựng nội dung và tương tác học tập. Nội dung giảng dạy ký hiệu được kiểm duyệt bởi người tạo ra dự án.
            </p>
          </div>

          {/* Contact */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
              <Mail className="w-4 h-4" />
              Liên hệ
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Góp ý, hợp tác hoặc báo lỗi:
            </p>
            <a
              href="mailto:mianaquynh@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors underline underline-offset-2"
            >
              <Mail className="w-3.5 h-3.5" />
              mianaquynh@gmail.com
            </a>
          </div>
        </div>

        {/* Safety & Pedagogical Note */}
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700 text-amber-900 dark:text-amber-200 text-xs md:text-sm font-medium leading-relaxed">
          <strong className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Lưu ý sư phạm &amp; Quyền riêng tư:
          </strong>
          Website hỗ trợ phụ huynh và trẻ nhỏ bước đầu làm quen và giao tiếp thông qua ngôn ngữ ký hiệu tự nhiên,{' '}
          <strong>không thay thế giáo dục chuyên biệt hoặc can thiệp y tế sớm</strong>. Hệ thống cam kết bảo vệ thông tin trẻ em
          và không lưu trữ dữ liệu cá nhân nhạy cảm. Nội dung có hỗ trợ từ công nghệ AI — người dùng có thể báo cáo nội dung
          không phù hợp qua email ở trên.
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 gap-2">
          <p>© 2026 SIGNORY Platform. Tôn vinh ngôn ngữ ký hiệu &amp; gắn kết gia đình.</p>
          <div className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
            <span>Thiết kế vì tình yêu thương gia đình</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
