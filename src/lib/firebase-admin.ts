import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

if (!getApps().length) {
  // Read the projectId directly from firebase-applet-config.json
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminAuth = getAuth();

// Server-side Firestore access (bypasses security rules, so it must only be used
// for data that clients are not allowed to write themselves, e.g. school membership).
// Needs Google credentials at runtime: automatic on Google Cloud / Cloud Run, or set
// GOOGLE_APPLICATION_CREDENTIALS locally.
const namedDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId?.trim();
export const adminDb =
  namedDatabaseId && namedDatabaseId !== '(default)' ? getFirestore(getApp(), namedDatabaseId) : getFirestore(getApp());
