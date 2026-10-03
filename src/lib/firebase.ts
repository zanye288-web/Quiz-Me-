import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress noisy internal @firebase/firestore offline/WebChannel retry console.error logs
try {
  setLogLevel('silent');
} catch {
  // Ignore if setLogLevel is unavailable
}

// Initialize Firebase App instance
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account' });

export const discordProvider = new OAuthProvider('oidc.discord');
export const instagramProvider = new OAuthProvider('oidc.instagram');
export const tiktokProvider = new OAuthProvider('oidc.tiktok');

// Initialize Cloud Firestore with provisioned named database & long-polling for iframe/proxy resilience
const dbName =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)' &&
  firebaseConfig.firestoreDatabaseId.trim() !== ''
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

function createResilientFirestore(): Firestore {
  try {
    return dbName
      ? initializeFirestore(
          app,
          {
            experimentalForceLongPolling: true,
            ignoreUndefinedProperties: true,
          },
          dbName
        )
      : initializeFirestore(app, {
          experimentalForceLongPolling: true,
          ignoreUndefinedProperties: true,
        });
  } catch {
    return dbName ? getFirestore(app, dbName) : getFirestore(app);
  }
}

export const db: Firestore = createResilientFirestore();

export {
  app,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  OAuthProvider,
};
export type { User };
