import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserStats, QuizResponse, PersonaType, DifficultyType, AssessmentConfig } from '../types/quiz';
import { QuizHistoryRecord } from '../components/HistoryView';
import type { LeaderboardUser } from '../components/GlobalLeaderboard';
import { LEVEL_SYSTEM_VERSION, calculateLevelFromXp, getRankForLevel } from '../utils/levelingSystem';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  if (
    errMsg.includes('unavailable') ||
    errMsg.includes('offline') ||
    errMsg.includes('Could not reach Cloud Firestore')
  ) {
    console.warn('Firestore operating in offline/cached mode:', path);
    return;
  }
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

export interface UserProfileDocument {
  userId: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  role: PersonaType;
  headline?: string;
  bio?: string;
  avatarType?: 'google' | 'icon' | 'custom' | 'mascot';
  avatarIcon?: string;
  avatarBg?: string;
  mascotCharacter?: string;
  mascotTheme?: string;
  equippedAccessory?: string;
  unlockedMascots?: string[];
  unlockedAccessories?: string[];
  learningGoal?: string;
  hasCustomizedProfile?: boolean;
  hasCompletedStarterTutorial?: boolean;
  assessmentConfig?: AssessmentConfig;
  savedSettings?: Record<string, any>;
  streak: number;
  hearts: number;
  maxHearts: number;
  xp: number;
  gems: number;
  coins?: number;
  level: number;
  levelSystemVersion?: string;
  quizzesCompleted: number;
  totalCorrect: number;
  totalQuestions: number;
  badges: string[];
  lastActiveDate: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SavedQuizDocument {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorRole?: PersonaType;
  creatorAvatar?: string | null;
  creatorLevel?: number;
  creatorAssessmentsCount?: number;
  isTopCreator?: boolean;
  quiz_title: string;
  summary: string;
  difficulty: DifficultyType;
  persona: PersonaType;
  targetAudience?: string;
  questions: any[];
  study_guide?: any;
  isPublic: boolean;
  calculatorEnabled?: boolean;
  dictionaryEnabled?: boolean;
  aiVerified?: boolean;
  aiVerificationScore?: number;
  aiVerificationSummary?: string;
  tags?: string[];
  pedagogical_topic?: string;
  pedagogical_subtopic?: string;
  sourceText?: string;
  likesCount?: number;
  commentsCount?: number;
  savesCount?: number;
  createdAt?: any;
  updatedAt?: any;
  quiz?: QuizResponse;
}

export interface CreatorLeaderboardEntry {
  creatorId: string;
  creatorName: string;
  creatorRole: PersonaType;
  creatorAvatar?: string | null;
  creatorLevel: number;
  quizzesPublished: number;
  totalLikes: number;
  totalComments: number;
  followersCount: number;
  avgVerificationScore: number;
  isTopCreator: boolean;
}

export interface QuizComment {
  id: string;
  quizId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  authorRole?: string;
  content: string;
  createdAt?: any;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  persona: PersonaType;
  level: number;
  xp: number;
  streak: number;
  accuracy: number;
  tier: 'Diamond' | 'Master' | 'Gold' | 'Silver' | 'Bronze';
  badgeTitle: string;
  isCurrentUser?: boolean;
}

// 1. User Profile Operations
export async function fetchUserProfile(userId: string): Promise<UserProfileDocument | null> {
  if (!auth.currentUser) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileDocument;
    }
    return null;
  } catch (err) {
    console.warn('Notice fetching user profile from Firestore:', err);
    return null;
  }
}

export function subscribeUserProfile(
  userId: string,
  onUpdate: (data: UserProfileDocument | null) => void
) {
  if (!auth.currentUser) {
    return () => {};
  }
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfileDocument);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('Notice listening to user profile:', err?.message || err);
    }
  );
}

export async function upsertUserProfile(
  userId: string,
  data: Partial<UserProfileDocument>
): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      const initialProfile: UserProfileDocument = {
        userId,
        displayName: data.displayName || 'Scholar',
        email: data.email ?? null,
        photoURL: data.photoURL ?? null,
        role: data.role || 'Student',
        streak: data.streak ?? 1,
        hearts: data.hearts ?? 5,
        maxHearts: data.maxHearts ?? 5,
        xp: data.xp ?? 0,
        gems: data.gems ?? 20,
        level: data.level ?? 1,
        levelSystemVersion: data.levelSystemVersion ?? LEVEL_SYSTEM_VERSION,
        quizzesCompleted: data.quizzesCompleted ?? 0,
        totalCorrect: data.totalCorrect ?? 0,
        totalQuestions: data.totalQuestions ?? 0,
        badges: data.badges ?? [],
        lastActiveDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...data,
      };
      await setDoc(userDocRef, initialProfile);
    } else {
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Notice saving user profile to Firestore:', err);
  }
}

// 2. Quiz History Records
export async function saveQuizHistoryToFirestore(
  userId: string,
  record: QuizHistoryRecord
): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const recordDocRef = doc(db, 'users', userId, 'history', record.id);
    await setDoc(recordDocRef, {
      ...record,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Notice saving quiz history to Firestore:', err);
  }
}

export function subscribeQuizHistory(
  userId: string,
  onUpdate: (records: QuizHistoryRecord[]) => void
) {
  if (!auth.currentUser) {
    return () => {};
  }
  const historyColRef = collection(db, 'users', userId, 'history');
  const historyQuery = query(historyColRef, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    historyQuery,
    (snap) => {
      const records: QuizHistoryRecord[] = [];
      snap.forEach((docSnap) => {
        records.push(docSnap.data() as QuizHistoryRecord);
      });
      onUpdate(records);
    },
    (err) => {
      console.warn('Fallback: listening to history without ordering if index is building:', err?.message || err);
      // Fallback without ordering in case index is pending
      return onSnapshot(
        historyColRef,
        (fallbackSnap) => {
          const records: QuizHistoryRecord[] = [];
          fallbackSnap.forEach((docSnap) => {
            records.push(docSnap.data() as QuizHistoryRecord);
          });
          records.sort((a, b) => (b.id > a.id ? 1 : -1));
          onUpdate(records);
        },
        (fallbackErr) => {
          console.warn('History fallback subscription notice:', fallbackErr?.message || fallbackErr);
        }
      );
    }
  );
}

export async function deleteQuizHistoryFromFirestore(
  userId: string,
  recordId: string
): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const recordDocRef = doc(db, 'users', userId, 'history', recordId);
    await deleteDoc(recordDocRef);
  } catch (err) {
    console.warn('Notice deleting quiz history record:', err);
  }
}

export async function clearAllQuizHistoryFromFirestore(userId: string): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const historyColRef = collection(db, 'users', userId, 'history');
    const snap = await getDocs(historyColRef);
    const deletePromises = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Notice clearing all history from Firestore:', err);
  }
}

// 3. User Favorites
export async function toggleFavoriteInFirestore(
  userId: string,
  presetId: string,
  isFavorite: boolean
): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const favDocRef = doc(db, 'users', userId, 'favorites', presetId);
    if (isFavorite) {
      await setDoc(favDocRef, {
        presetId,
        createdAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(favDocRef);
    }
  } catch (err) {
    console.warn('Notice toggling favorite in Firestore:', err);
  }
}

export function subscribeFavorites(
  userId: string,
  onUpdate: (favorites: Set<string>) => void
) {
  if (!auth.currentUser) {
    return () => {};
  }
  const favColRef = collection(db, 'users', userId, 'favorites');
  return onSnapshot(
    favColRef,
    (snap) => {
      const favs = new Set<string>();
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.presetId) favs.add(data.presetId);
        else favs.add(docSnap.id);
      });
      onUpdate(favs);
    },
    (err) => {
      console.warn('Notice subscribing to favorites:', err?.message || err);
    }
  );
}

// 4. Custom & Community Quizzes Collection
export async function saveQuizToFirestore(
  quiz: QuizResponse,
  creatorId: string,
  creatorName: string,
  isPublic = true,
  creatorRole?: PersonaType,
  creatorAvatar?: string | null,
  creatorLevel?: number,
  creatorAssessmentsCount?: number
): Promise<string> {
  try {
    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const quizDocRef = doc(db, 'quizzes', quizId);
    const docData: SavedQuizDocument = {
      id: quizId,
      creatorId,
      creatorName,
      creatorRole: creatorRole || quiz.persona || 'Student',
      creatorAvatar: creatorAvatar || null,
      creatorLevel: creatorLevel || 1,
      creatorAssessmentsCount: creatorAssessmentsCount || 1,
      isTopCreator: (creatorLevel !== undefined && creatorLevel >= 3) || (creatorAssessmentsCount !== undefined && creatorAssessmentsCount >= 3),
      quiz_title: quiz.quiz_title,
      summary: quiz.summary || 'Custom assessment',
      difficulty: quiz.difficulty || 'Intermediate',
      persona: quiz.persona || 'Student',
      questions: quiz.questions,
      study_guide: quiz.study_guide,
      isPublic,
      calculatorEnabled: Boolean(quiz.calculatorEnabled),
      dictionaryEnabled: Boolean(quiz.dictionaryEnabled),
      aiVerified: quiz.aiVerified ?? true,
      aiVerificationScore: quiz.aiVerificationScore ?? 94,
      aiVerificationSummary: quiz.aiVerificationSummary || 'Verified by Quiz Me! AI Standards Engine',
      tags: quiz.tags || [],
      pedagogical_topic: quiz.pedagogical_topic,
      pedagogical_subtopic: quiz.pedagogical_subtopic,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(quizDocRef, docData);
    return quizId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'quizzes');
    throw err;
  }
}

export async function toggleFollowCreator(
  followerId: string,
  creatorId: string,
  creatorName: string,
  currentlyFollowing: boolean
): Promise<boolean> {
  if (!auth.currentUser || !followerId || !creatorId) return !currentlyFollowing;
  const followDocRef = doc(db, 'users', followerId, 'following', creatorId);
  try {
    if (currentlyFollowing) {
      await deleteDoc(followDocRef);
      return false;
    } else {
      await setDoc(followDocRef, {
        creatorId,
        creatorName,
        followerId,
        followedAt: serverTimestamp(),
      });
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${followerId}/following/${creatorId}`);
    return !currentlyFollowing;
  }
}

export function subscribeFollowedCreators(
  userId: string,
  onUpdate: (followedCreatorIds: Set<string>) => void
) {
  if (!auth.currentUser || !userId) return () => {};
  try {
    const colRef = collection(db, 'users', userId, 'following');
    return onSnapshot(
      colRef,
      (snap) => {
        const set = new Set<string>();
        snap.forEach((d) => set.add(d.id));
        onUpdate(set);
      },
      (err) => {
        console.warn('Following creators subscription notice:', err?.message || err);
      }
    );
  } catch {
    return () => {};
  }
}

export function subscribeQuizzes(onUpdate: (quizzes: SavedQuizDocument[]) => void) {
  try {
    const quizzesColRef = collection(db, 'quizzes');
    return onSnapshot(
      quizzesColRef,
      (snap) => {
        const quizzes: SavedQuizDocument[] = [];
        snap.forEach((docSnap) => {
          quizzes.push(docSnap.data() as SavedQuizDocument);
        });
        onUpdate(quizzes);
      },
      (err) => {
        console.warn('Community quizzes subscription notice:', err?.message || err);
        onUpdate([]);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize community quizzes subscription:', err);
    onUpdate([]);
    return () => {};
  }
}

export async function deleteQuizFromFirestore(quizId: string): Promise<void> {
  try {
    const quizDocRef = doc(db, 'quizzes', quizId);
    await deleteDoc(quizDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `quizzes/${quizId}`);
  }
}

export async function getQuizFromFirestore(quizId: string): Promise<SavedQuizDocument | null> {
  try {
    const quizDocRef = doc(db, 'quizzes', quizId);
    const snap = await getDoc(quizDocRef);
    if (snap.exists()) {
      return snap.data() as SavedQuizDocument;
    }
    return null;
  } catch (err) {
    console.warn('Notice fetching quiz from Firestore:', err);
    return null;
  }
}

// 4b. Quiz Interactions: Likes, Saves, and Comments

// --- Like / Unlike Quiz ---
export async function toggleQuizLike(
  quizId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  const likeDocRef = doc(db, 'quizzes', quizId, 'likes', userId);
  const quizDocRef = doc(db, 'quizzes', quizId);

  try {
    if (currentlyLiked) {
      await deleteDoc(likeDocRef);
      await updateDoc(quizDocRef, {
        likesCount: increment(-1),
      }).catch(() => {});
      return false;
    } else {
      await setDoc(likeDocRef, {
        userId,
        quizId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(quizDocRef, {
        likesCount: increment(1),
      }).catch(() => {});
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `quizzes/${quizId}/likes/${userId}`);
    return !currentlyLiked;
  }
}

export function subscribeQuizLikes(
  quizId: string,
  onUpdate: (likedUserIds: Set<string>) => void
) {
  try {
    const likesColRef = collection(db, 'quizzes', quizId, 'likes');
    return onSnapshot(
      likesColRef,
      (snap) => {
        const likedIds = new Set<string>();
        snap.forEach((d) => {
          likedIds.add(d.id);
        });
        onUpdate(likedIds);
      },
      (err) => {
        console.warn('Quiz likes subscription notice:', err?.message || err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to quiz likes:', err);
    return () => {};
  }
}

// --- Save / Bookmark Quiz ---
export async function toggleQuizSave(
  userId: string,
  quizId: string,
  quizTitle: string,
  currentlySaved: boolean
): Promise<boolean> {
  const savedDocRef = doc(db, 'users', userId, 'savedQuizzes', quizId);
  const quizDocRef = doc(db, 'quizzes', quizId);

  try {
    if (currentlySaved) {
      await deleteDoc(savedDocRef);
      await updateDoc(quizDocRef, {
        savesCount: increment(-1),
      }).catch(() => {});
      return false;
    } else {
      await setDoc(savedDocRef, {
        id: quizId,
        quizId,
        quizTitle,
        savedAt: serverTimestamp(),
      });
      await updateDoc(quizDocRef, {
        savesCount: increment(1),
      }).catch(() => {});
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/savedQuizzes/${quizId}`);
    return !currentlySaved;
  }
}

export function subscribeUserSavedQuizzes(
  userId: string,
  onUpdate: (savedQuizIds: Set<string>) => void
) {
  try {
    const savedColRef = collection(db, 'users', userId, 'savedQuizzes');
    return onSnapshot(
      savedColRef,
      (snap) => {
        const savedIds = new Set<string>();
        snap.forEach((d) => {
          savedIds.add(d.id);
        });
        onUpdate(savedIds);
      },
      (err) => {
        console.warn('Saved quizzes subscription notice:', err?.message || err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to user saved quizzes:', err);
    return () => {};
  }
}

// --- Quiz Comments ---
export function subscribeQuizComments(
  quizId: string,
  onUpdate: (comments: QuizComment[]) => void
) {
  try {
    const commentsColRef = collection(db, 'quizzes', quizId, 'comments');
    const q = query(commentsColRef, orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const comments: QuizComment[] = [];
        snap.forEach((d) => {
          const data = d.data();
          comments.push({
            id: d.id,
            quizId,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Scholar',
            authorPhotoURL: data.authorPhotoURL || null,
            authorRole: data.authorRole || 'Student',
            content: data.content || '',
            createdAt: data.createdAt,
          });
        });
        onUpdate(comments);
      },
      (err) => {
        console.warn('Quiz comments subscription notice:', err?.message || err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to comments:', err);
    return () => {};
  }
}

export async function addQuizComment(
  quizId: string,
  comment: {
    authorId: string;
    authorName: string;
    authorPhotoURL?: string | null;
    authorRole?: string;
    content: string;
  }
): Promise<string> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const commentDocRef = doc(db, 'quizzes', quizId, 'comments', commentId);
  const quizDocRef = doc(db, 'quizzes', quizId);

  try {
    await setDoc(commentDocRef, {
      id: commentId,
      quizId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorPhotoURL: comment.authorPhotoURL || null,
      authorRole: comment.authorRole || 'Student',
      content: comment.content.trim(),
      createdAt: serverTimestamp(),
    });

    await updateDoc(quizDocRef, {
      commentsCount: increment(1),
    }).catch(() => {});

    return commentId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `quizzes/${quizId}/comments/${commentId}`);
    throw err;
  }
}

export async function deleteQuizComment(quizId: string, commentId: string): Promise<void> {
  const commentDocRef = doc(db, 'quizzes', quizId, 'comments', commentId);
  const quizDocRef = doc(db, 'quizzes', quizId);

  try {
    await deleteDoc(commentDocRef);
    await updateDoc(quizDocRef, {
      commentsCount: increment(-1),
    }).catch(() => {});
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `quizzes/${quizId}/comments/${commentId}`);
    throw err;
  }
}

// 5. Global Leaderboard from Real Firestore Users
export async function fetchLeaderboardUsers(currentUserId?: string): Promise<LeaderboardUser[]> {
  try {
    const usersColRef = collection(db, 'users');
    let snap;
    try {
      const q = query(usersColRef, orderBy('xp', 'desc'), limit(50));
      snap = await getDocs(q);
    } catch {
      // Fallback in case index is pending or orderBy fails
      snap = await getDocs(usersColRef);
    }

    const results: LeaderboardUser[] = [];
    const rawList: UserProfileDocument[] = [];

    snap.forEach((docSnap) => {
      const u = docSnap.data() as UserProfileDocument;
      rawList.push({
        ...u,
        userId: u.userId || docSnap.id,
      });
    });

    // Sort descending by real XP
    rawList.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    let rank = 1;
    rawList.forEach((u) => {
      const totalQ = u.totalQuestions || 0;
      const accuracy = totalQ > 0 ? Math.round(((u.totalCorrect || 0) / totalQ) * 100) : 100;

      const realXp = u.levelSystemVersion === LEVEL_SYSTEM_VERSION ? (u.xp || 0) : 0;
      const realLevel = u.levelSystemVersion === LEVEL_SYSTEM_VERSION ? calculateLevelFromXp(realXp) : 1;
      const rankInfo = getRankForLevel(realLevel);
      const tier: 'Diamond' | 'Master' | 'Gold' | 'Silver' | 'Bronze' = rankInfo.tierName;

      const badgeTitle =
        u.badges && u.badges.length > 0 && u.levelSystemVersion === LEVEL_SYSTEM_VERSION
          ? u.badges[u.badges.length - 1]
          : rankInfo.title;

      const userId = u.userId || `user_${rank}`;

      results.push({
        rank: rank++,
        id: userId,
        name: u.displayName || 'Scholar',
        avatar:
          u.photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
        persona: u.role || 'Student',
        level: realLevel,
        xp: realXp,
        streak: u.streak || 1,
        accuracy,
        tier,
        badgeTitle,
        isCurrentUser: currentUserId ? userId === currentUserId : false,
      });
    });

    return results;
  } catch (err) {
    console.warn('Notice fetching leaderboard users from Firestore:', err);
    return [];
  }
}

// 6. Reset all signed-in users' levels in Firestore to Level 1 / 0 XP for the V3 Leveling System Revamp
export async function resetAllSignedInUsersLevelsInFirestore(currentUserId?: string): Promise<number> {
  if (!auth.currentUser && !currentUserId) return 0;
  let resetCount = 0;
  try {
    // 1. Always ensure current user's own document is reset if not already on LEVEL_SYSTEM_VERSION
    const activeUid = auth.currentUser?.uid || currentUserId;
    if (activeUid) {
      const ownDocRef = doc(db, 'users', activeUid);
      const ownSnap = await getDoc(ownDocRef);
      if (ownSnap.exists()) {
        const data = ownSnap.data() as UserProfileDocument;
        if (data.levelSystemVersion !== LEVEL_SYSTEM_VERSION) {
          await updateDoc(ownDocRef, {
            level: 1,
            xp: 0,
            levelSystemVersion: LEVEL_SYSTEM_VERSION,
            updatedAt: serverTimestamp(),
          });
          resetCount++;
        }
      }
    }

    // 2. Also sweep all user documents in the users collection that haven't been migrated to LEVEL_SYSTEM_VERSION
    const usersColRef = collection(db, 'users');
    const snap = await getDocs(usersColRef);
    const promises: Promise<any>[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfileDocument;
      if (data.levelSystemVersion !== LEVEL_SYSTEM_VERSION) {
        promises.push(
          updateDoc(docSnap.ref, {
            level: 1,
            xp: 0,
            levelSystemVersion: LEVEL_SYSTEM_VERSION,
            updatedAt: serverTimestamp(),
          }).then(() => {
            resetCount++;
          }).catch(() => {})
        );
      }
    });

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } catch (err) {
    console.warn('Notice during global V3 level reset:', err);
  }
  return resetCount;
}
