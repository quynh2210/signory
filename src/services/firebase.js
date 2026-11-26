import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  CustomProvider,
} from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFlM9_0T5SdEG5WbWjXMUFj_X-qkV-2NE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "signory-51079.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "signory-51079",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "signory-51079.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "571158864168",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:571158864168:web:2e4f5bef95bbda571d701d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V5EDMHQD4L"
};

// 1. Initialize Firebase App (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firebase App Check STRICTLY ONCE before Auth, Firestore, and AI Logic
const isLocalDevelopment =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname));

function initAppCheckOnce(firebaseApp) {
  if (typeof window === 'undefined') return null;

  if (globalThis.__SIGNORY_APP_CHECK__) {
    return globalThis.__SIGNORY_APP_CHECK__;
  }

  let provider;

  if (isLocalDevelopment) {
    // Local environment: activate Firebase App Check Debug Provider ONLY
    const debugTokenEnv = import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN;
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugTokenEnv && debugTokenEnv !== 'true' ? debugTokenEnv : true;

    // Lightweight placeholder provider: in debug mode, Firebase App Check SDK
    // automatically intercepts getToken()/getLimitedUseToken() and exchanges the debug token.
    provider = new CustomProvider({
      getToken: async () => {
        throw new Error('Firebase App Check Debug mode requires a registered debug token.');
      },
    });
  } else {
    // Production environment: use ReCaptchaEnterpriseProvider ONLY (public site key)
    const siteKey = String(
      import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY ||
        '6Lf2CDIuAAAAAGRf9jWnFD-iQSz9StDjLZ05v035'
    ).trim();
    provider = new ReCaptchaEnterpriseProvider(siteKey);
  }

  globalThis.__SIGNORY_APP_CHECK__ = initializeAppCheck(firebaseApp, {
    provider,
    isTokenAutoRefreshEnabled: true,
  });

  return globalThis.__SIGNORY_APP_CHECK__;
}

export const appCheck = initAppCheckOnce(app);

// 3. Initialize protected Firebase services AFTER App Check
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ai = getAI(app, { backend: new GoogleAIBackend() });

export {
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
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
};

export default app;
