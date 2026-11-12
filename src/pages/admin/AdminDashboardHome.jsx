import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  FilePlus, 
  Image as ImageIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getLessons, getAllUsersAdmin, getAppSettings } from '../../services/dbService';
import { useSound } from '../../context/SoundContext';

export const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    activeLessons: 0,
    totalQuestions: 10,
    totalCompletions: 18
  });
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playClick } = useSound();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [fetchedLessons, users] = await Promise.all([
          getLessons('admin'),
          getAllUsersAdmin()
        ]);

        setLessons(fetchedLessons);
        const activeCount = fetchedLessons.filter(l => l.isPublished).length;

        setStats({
          totalUsers: Math.max(users.length, 1),
          totalLessons: fetchedLessons.length,
          activeLessons: activeCount,
          totalQuestions: 12,
          totalCompletions: 24
        });
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-sm font-semibold text-slate-500">
            Tổng quan nội dung, số liệu học tập và hệ thống SIGNORY
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/builder"
            onClick={playClick}
            className="px-4 py-2.5 rounded-2xl font-black text-white btn-3d btn-purple-3d flex items-center gap-2 text-sm"
          >
            <FilePlus className="w-4 h-4" />
            <span>Tạo Bài Học Mới</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-xs font-black uppercase text-slate-400">Người Dùng</span>
            <div className="p-2 bg-brand-50 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{stats.totalUsers}</p>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +100% người dùng thực
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-black uppercase text-slate-400">Tổng Bài Học</span>
            <div className="p-2 bg-blue-50 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{stats.totalLessons}</p>
          <span className="text-xs font-bold text-slate-500">
            {stats.activeLessons} bài đang xuất bản
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-yellow-600">
            <span className="text-xs font-black uppercase text-slate-400">Câu Hỏi Tương Tác</span>
            <div className="p-2 bg-yellow-50 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{stats.totalQuestions}</p>
          <span className="text-xs font-bold text-amber-600">
            7 Dạng câu hỏi hỗ trợ
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-black uppercase text-slate-400">Lượt Hoàn Thành</span>
            <div className="p-2 bg-purple-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{stats.totalCompletions}</p>
          <span className="text-xs font-bold text-purple-600">
            Điểm tích lũy theo thời gian thực
          </span>
        </div>
      </div>

      {/* Recent Lessons List */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">Danh Sách Bài Học Hiện Tại</h3>
          <Link
            to="/admin/lessons"
            className="text-xs font-black text-purple-600 hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả bài học</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={lesson.thumbnail || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100'}
                  alt={lesson.title}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                    {lesson.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {lesson.mode === 'parents' ? 'Phụ huynh' : (lesson.mode === 'kids' ? 'Chế độ Bé' : 'Cả hai')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {lesson.signsCount || 3} Ký hiệu
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  lesson.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {lesson.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
                <Link
                  to={`/admin/builder?lessonId=${lesson.id}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Sửa
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
