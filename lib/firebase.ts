import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

// ─────────────────────────────────────────────────────────
// Firebase Configuration for AGRONOMY 360
// Values read from .env.local
// ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDjos1-2OyaLopdASy6Xd7pIk83o0iZ3HE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "agronomy360-15611.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "agronomy360-15611",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "agronomy360-15611.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1041398688765",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1041398688765:web:55f12d2119b89282e04794",
};

// Check if Firebase is properly configured with an API key
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "YOUR_API_KEY" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length > 15
);

let app: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    auth.useDeviceLanguage();
  } catch (err) {
    console.warn("Firebase init skipped or failed:", err);
  }
}

export {
  auth,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
};
export type { ConfirmationResult };
export default app;
