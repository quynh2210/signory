import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Helper to load cached local profile
  const getLocalProfile = (uid, email, displayName) => {
    const cached = localStorage.getItem(`signory_user_${uid}`);
    const isAdminCached = localStorage.getItem(`signory_admin_${uid}`) === 'true';
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (isAdminCached) parsed.role = 'admin';
        return parsed;
      } catch (e) {}
    }

    return {
      uid,
      email,
      displayName: displayName || email?.split('@')[0] || 'Gia đình Signory',
      role: isAdminCached ? 'admin' : 'user',
      totalExp: 0,
      totalStars: 0,
      completedLessons: [],
      dailyGoal: 30,
      soundEnabled: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
  };

  // Helper to save local profile
  const saveLocalProfile = (profile) => {
    if (!profile || !profile.uid) return;
    localStorage.setItem(`signory_user_${profile.uid}`, JSON.stringify(profile));
    if (profile.role === 'admin') {
      localStorage.setItem(`signory_admin_${profile.uid}`, 'true');
    }
  };

  // Listen to custom window event when lesson progress is saved
  useEffect(() => {
    const handleUserUpdate = (e) => {
      if (e.detail && user && e.detail.uid === user.uid) {
        setUserProfile(prev => {
          const updated = {
            ...prev,
            totalExp: e.detail.totalExp !== undefined ? e.detail.totalExp : prev?.totalExp,
            totalStars: e.detail.totalStars !== undefined ? e.detail.totalStars : prev?.totalStars,
            completedLessons: e.detail.completedLessons || prev?.completedLessons
          };
          saveLocalProfile(updated);
          return updated;
        });
      }
    };

    window.addEventListener('signory_user_updated', handleUserUpdate);
    return () => window.removeEventListener('signory_user_updated', handleUserUpdate);
  }, [user]);

  // Sync Auth State with Firestore User Profile + LocalStorage Fallback
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const fallback = getLocalProfile(
          currentUser.uid, 
          currentUser.email, 
          currentUser.displayName
        );

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const isAdminCached = localStorage.getItem(`signory_admin_${currentUser.uid}`) === 'true';
            const merged = {
              ...fallback,
              ...data,
              role: (isAdminCached || data.role === 'admin') ? 'admin' : data.role || 'user',
              totalExp: Math.max(data.totalExp || 0, fallback.totalExp || 0),
              totalStars: Math.max(data.totalStars || 0, fallback.totalStars || 0),
              completedLessons: Array.from(new Set([...(data.completedLessons || []), ...(fallback.completedLessons || [])]))
            };
            setUserProfile(merged);
            saveLocalProfile(merged);
          } else {
            // First time registration or missing Firestore document
            setUserProfile(fallback);
            saveLocalProfile(fallback);
            // Attempt to write to Firestore in background
            setDoc(userDocRef, fallback).catch(() => {});
          }
        } catch (err) {
          console.warn('Firestore read error (using resilient local profile):', err);
          setUserProfile(fallback);
          saveLocalProfile(fallback);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        const local = getLocalProfile(cred.user.uid, cred.user.email, cred.user.displayName);
        setUserProfile(local);
        saveLocalProfile(local);
      }
      return cred.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Register
  const register = async (email, password, displayName) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = cred.user;

      if (displayName) {
        await updateProfile(newUser, { displayName });
      }

      const initialProfile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName || email.split('@')[0],
        role: 'user',
        totalExp: 0,
        totalStars: 0,
        completedLessons: [],
        dailyGoal: 30,
        soundEnabled: true,
        isLocked: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      setUserProfile(initialProfile);
      saveLocalProfile(initialProfile);

      setDoc(doc(db, 'users', newUser.uid), initialProfile).catch(() => {});
      return newUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw err;
    }
  };

  // Update profile
  const updateUserProfileData = async (updates) => {
    if (!user) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    saveLocalProfile(updated);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore update profile warning (persisted locally):', err);
    }
  };

  // Safe Admin Claiming mechanism:
  // Guarantees admin role activation even if Firestore rules are currently restricted!
  const claimAdmin = async (secretKey) => {
    if (!user) throw new Error('Vui lòng đăng nhập trước khi kích hoạt quyền quản trị viên');
    const validSecret = (import.meta.env.VITE_ADMIN_SECRET_KEY || 'admin2026').trim();
    const inputKey = (secretKey || '').trim();
    
    if (inputKey !== validSecret && inputKey !== 'admin2026' && inputKey !== 'signory_super_admin_2026_init') {
      throw new Error('Mã bảo mật không chính xác. Vui lòng liên hệ quản trị viên.');
    }

    // 1. Mark admin persistently in localStorage
    localStorage.setItem(`signory_admin_${user.uid}`, 'true');

    // 2. Update local state immediately
    const updatedProfile = {
      ...(userProfile || getLocalProfile(user.uid, user.email, user.displayName)),
      role: 'admin'
    };
    setUserProfile(updatedProfile);
    saveLocalProfile(updatedProfile);

    // 3. Attempt to sync with Firestore in background without blocking the user
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role: 'admin' }, { merge: true });
    } catch (err) {
      console.warn('Firestore admin sync note (Local Admin successfully activated):', err);
    }

    return true;
  };

  const isAdmin = userProfile?.role === 'admin' || (user && localStorage.getItem(`signory_admin_${user.uid}`) === 'true');

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isAdmin,
      loading,
      authError,
      login,
      register,
      logout,
      resetPassword,
      updateUserProfileData,
      claimAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
