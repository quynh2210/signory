import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/layout/AuthModal';

import HomePage from './pages/HomePage';
import ParentsModePage from './pages/ParentsModePage';
import KidsModePage from './pages/KidsModePage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import StoryMapPage from './pages/StoryMapPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminLessonsList from './pages/admin/AdminLessonsList';
import AdminLessonBuilder from './pages/admin/AdminLessonBuilder';
import AdminMediaManager from './pages/admin/AdminMediaManager';
import AdminUsersList from './pages/admin/AdminUsersList';
import AdminBadgesList from './pages/admin/AdminBadgesList';
import AdminSettings from './pages/admin/AdminSettings';
import AdminVideoManager from './pages/admin/AdminVideoManager';
import AdminStoryManager from './pages/admin/AdminStoryManager';
import WatchVideoPage from './pages/WatchVideoPage';

import { seedInitialDataToFirestore } from './services/dbService';

function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const location = useLocation();

  const isLessonPlayer = location.pathname.startsWith('/lesson/');
  const isAdmin = location.pathname.startsWith('/admin');
  const isWatchPage = location.pathname.startsWith('/watch/');

  useEffect(() => {
    seedInitialDataToFirestore(false).catch(err => {
      console.warn('Initial seed check:', err);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
      {!isLessonPlayer && !isAdmin && !isWatchPage && (
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      )}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/parents" element={<ParentsModePage />} />
          <Route path="/kids" element={<KidsModePage />} />
          <Route path="/stories" element={<StoryMapPage />} />
          <Route path="/stories/:storyId" element={<StoryMapPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPlayerPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Standalone Watch Page */}
          <Route path="/watch/:videoId" element={<WatchVideoPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardHome />} />
            <Route path="lessons" element={<AdminLessonsList />} />
            <Route path="builder" element={<AdminLessonBuilder />} />
            <Route path="media" element={<AdminMediaManager />} />
            <Route path="videos" element={<AdminVideoManager />} />
            <Route path="stories" element={<AdminStoryManager />} />
            <Route path="users" element={<AdminUsersList />} />
            <Route path="badges" element={<AdminBadgesList />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </div>

      {!isLessonPlayer && !isAdmin && !isWatchPage && <Footer />}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SoundProvider>
            <AppContent />
          </SoundProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
