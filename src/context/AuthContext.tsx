import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  googleProvider,
  microsoftProvider,
  discordProvider,
  instagramProvider,
  tiktokProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from '../lib/firebase';
import {
  UserProfileDocument,
  subscribeUserProfile,
  upsertUserProfile,
  resetAllSignedInUsersLevelsInFirestore,
} from '../services/firestore';
import { UserStats, PersonaType, AssessmentConfig } from '../types/quiz';
import { LEVEL_SYSTEM_VERSION } from '../utils/levelingSystem';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileDocument | null;
  isAuthLoading: boolean;
  isFirebaseConnected: boolean;
  isSwitchingAccount: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithInstagram: () => Promise<void>;
  signInWithTikTok: () => Promise<void>;
  signInAsGuest: (displayName?: string, role?: PersonaType) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, role?: PersonaType) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: () => Promise<void>;
  cancelSwitchAccount: () => void;
  updatePersonaInCloud: (persona: PersonaType) => Promise<void>;
  updateUserProfileInCloud: (profileData: Partial<UserProfileDocument>) => Promise<void>;
  syncStatsToCloud: (stats: UserStats) => Promise<void>;
  syncAssessmentConfigToCloud: (config: AssessmentConfig) => Promise<void>;
}

const SCHOLAR_SESSION_KEY = 'quizme_authenticated_scholar_v2';
const SWITCH_ACCOUNT_FLAG_KEY = 'quizme_switching_account_flag';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try restoring active session from localStorage so page refreshes or iframe reloads never boot the user out
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(SCHOLAR_SESSION_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.uid) {
            return parsed as User;
          }
        } catch {
          // parse fallback
        }
      }
    }
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfileDocument | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    // If we already have a cached session, don't show full loading gate
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(SCHOLAR_SESSION_KEY);
      if (cached) return false;
    }
    return true;
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SWITCH_ACCOUNT_FLAG_KEY) === 'true';
    }
    return false;
  });

  // Helper to persist user session
  const saveSession = (u: User | any) => {
    try {
      const sessionData = {
        uid: u.uid,
        displayName: u.displayName || 'Scholar',
        email: u.email || null,
        photoURL: u.photoURL || null,
        isAnonymous: false,
      };
      localStorage.setItem(SCHOLAR_SESSION_KEY, JSON.stringify(sessionData));
      sessionStorage.removeItem(SWITCH_ACCOUNT_FLAG_KEY);
      setIsSwitchingAccount(false);
    } catch (e) {
      console.warn('Could not cache scholar session:', e);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // 1. Real authenticated user detected from Firebase Auth
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
        saveSession(currentUser);
        setIsFirebaseConnected(true);

        // Ensure user profile document exists in Firestore
        try {
          await upsertUserProfile(currentUser.uid, {
            displayName: currentUser.displayName || 'Scholar',
            email: currentUser.email || null,
            photoURL: currentUser.photoURL || null,
          });
        } catch (profileErr) {
          console.warn('Upsert profile notice:', profileErr);
        }

        // Real-time listener for user profile
        if (unsubscribeProfile) unsubscribeProfile();
        unsubscribeProfile = subscribeUserProfile(currentUser.uid, (profile) => {
          if (profile) {
            if (profile.levelSystemVersion !== LEVEL_SYSTEM_VERSION) {
              // Automatically reset signed-in user's level to Level 1 (0 XP) for V3 Revamp
              const resetProfile: UserProfileDocument = {
                ...profile,
                level: 1,
                xp: 0,
                levelSystemVersion: LEVEL_SYSTEM_VERSION,
              };
              setUserProfile(resetProfile);
              resetAllSignedInUsersLevelsInFirestore(currentUser.uid).catch(() => {});
            } else {
              setUserProfile(profile);
            }
          }
        });

        // Also sweep all signed-in users in Firestore once to ensure everyone is reset to Level 1
        resetAllSignedInUsersLevelsInFirestore(currentUser.uid).catch(() => {});

        setIsAuthLoading(false);
      } else {
        // 2. Firebase returned null (or anonymous).
        // Check if user was previously authenticated and DID NOT click Sign Out or Switch Account:
        const savedSession = typeof window !== 'undefined' ? localStorage.getItem(SCHOLAR_SESSION_KEY) : null;
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.uid) {
              // Maintain consistent login state across page refreshes, tab switches, and iframe reconnects
              setUser(parsed as User);
              setIsFirebaseConnected(true);

              if (unsubscribeProfile) unsubscribeProfile();
              unsubscribeProfile = subscribeUserProfile(parsed.uid, (profile) => {
                if (profile) {
                  if (profile.levelSystemVersion !== LEVEL_SYSTEM_VERSION) {
                    const resetProfile: UserProfileDocument = {
                      ...profile,
                      level: 1,
                      xp: 0,
                      levelSystemVersion: LEVEL_SYSTEM_VERSION,
                    };
                    setUserProfile(resetProfile);
                    resetAllSignedInUsersLevelsInFirestore(parsed.uid).catch(() => {});
                  } else {
                    setUserProfile(profile);
                  }
                }
              });

              setIsAuthLoading(false);
              return;
            }
          } catch {
            // fallback
          }
        }

        // 3. User explicitly signed out or switched account: return to login page
        setUser(null);
        setUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        if (currentUser?.isAnonymous) {
          signOut(auth).catch(() => {});
        }
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithSocial = async (provider: any, providerName: string) => {
    try {
      setIsAuthLoading(true);
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      saveSession(res.user);
      setIsFirebaseConnected(true);
      await upsertUserProfile(res.user.uid, {
        displayName: res.user.displayName || 'Scholar',
        email: res.user.email || null,
        photoURL: res.user.photoURL || null,
      });
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed' || err?.message?.includes('network-request-failed')) {
        console.warn(`${providerName} sign-in restricted by browser/iframe security settings:`, err);
      } else {
        console.error(`${providerName} sign-in error:`, err);
      }
      if (err?.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signInWithGoogle = () => signInWithSocial(googleProvider, 'Google');
  const signInWithMicrosoft = () => signInWithSocial(microsoftProvider, 'Microsoft');
  const signInWithDiscord = () => signInWithSocial(discordProvider, 'Discord');
  const signInWithInstagram = () => signInWithSocial(instagramProvider, 'Instagram');
  const signInWithTikTok = () => signInWithSocial(tiktokProvider, 'TikTok');

  const signInAsGuest = async (displayName = 'Guest Scholar', role: PersonaType = 'Student') => {
    try {
      setIsAuthLoading(true);
      const existingUid = localStorage.getItem('quizme_guest_uid');
      const guestUid = existingUid || `scholar_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('quizme_guest_uid', guestUid);

      const guestUser: any = {
        uid: guestUid,
        displayName,
        email: null,
        photoURL: null,
        isAnonymous: true,
      };

      setUser(guestUser);
      saveSession(guestUser);
      setIsFirebaseConnected(true);

      // Upsert profile in background
      await upsertUserProfile(guestUid, {
        displayName,
        email: null,
        role,
        hasCustomizedProfile: false,
      }).catch((err) => {
        console.info('Guest scholar profile local store:', err);
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setIsAuthLoading(true);
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(res.user);
      saveSession(res.user);
      setIsFirebaseConnected(true);
      await upsertUserProfile(res.user.uid, {
        displayName: res.user.displayName || 'Scholar',
        email: res.user.email || null,
      });
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, role: PersonaType = 'Student') => {
    try {
      setIsAuthLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const trimmedName = displayName.trim() || 'Scholar';
      await updateProfile(res.user, { displayName: trimmedName });
      setUser(res.user);
      saveSession(res.user);
      setIsFirebaseConnected(true);
      await upsertUserProfile(res.user.uid, {
        displayName: trimmedName,
        email: res.user.email || null,
        role: role,
        hasCustomizedProfile: false,
      });
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.error('Password reset error:', err);
      throw err;
    }
  };

  /**
   * Explicit sign out: Clears session cache and returns user to login page
   */
  const logout = async () => {
    try {
      setIsAuthLoading(true);
      localStorage.removeItem(SCHOLAR_SESSION_KEY);
      sessionStorage.removeItem(SWITCH_ACCOUNT_FLAG_KEY);
      setIsSwitchingAccount(false);
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setUser(null);
      setUserProfile(null);
      setIsAuthLoading(false);
    }
  };

  /**
   * Explicit switch account: Clears current session, sets switch flag,
   * and takes user to login page with switch banner
   */
  const switchAccount = async () => {
    try {
      setIsAuthLoading(true);
      localStorage.removeItem(SCHOLAR_SESSION_KEY);
      sessionStorage.setItem(SWITCH_ACCOUNT_FLAG_KEY, 'true');
      setIsSwitchingAccount(true);
      await signOut(auth);
    } catch (err) {
      console.error('Switch account error:', err);
    } finally {
      setUser(null);
      setUserProfile(null);
      setIsAuthLoading(false);
    }
  };

  const cancelSwitchAccount = () => {
    sessionStorage.removeItem(SWITCH_ACCOUNT_FLAG_KEY);
    setIsSwitchingAccount(false);
  };

  const updatePersonaInCloud = async (persona: PersonaType) => {
    if (!user) return;
    try {
      await upsertUserProfile(user.uid, { role: persona });
    } catch (err) {
      console.error('Error updating persona in Firestore:', err);
    }
  };

  const updateUserProfileInCloud = async (profileData: Partial<UserProfileDocument>) => {
    if (!user) return;
    try {
      await upsertUserProfile(user.uid, profileData);
      setUserProfile((prev) => (prev ? { ...prev, ...profileData } : null));
    } catch (err) {
      console.error('Error updating profile in Firestore:', err);
    }
  };

  const syncStatsToCloud = async (stats: UserStats) => {
    if (!user) return;
    try {
      await upsertUserProfile(user.uid, {
        streak: stats.streak,
        hearts: stats.hearts,
        maxHearts: stats.maxHearts,
        xp: stats.xp,
        gems: stats.gems,
        ...(stats.coins !== undefined ? { coins: stats.coins } : {}),
        ...(stats.unlockedMascots ? { unlockedMascots: stats.unlockedMascots } : {}),
        ...(stats.unlockedAccessories ? { unlockedAccessories: stats.unlockedAccessories } : {}),
        ...(stats.equippedAccessory !== undefined ? { equippedAccessory: stats.equippedAccessory } : {}),
        level: stats.level,
        levelSystemVersion: LEVEL_SYSTEM_VERSION,
        quizzesCompleted: stats.quizzesCompleted,
        totalCorrect: stats.totalCorrect,
        totalQuestions: stats.totalQuestions,
        badges: stats.badges,
        lastActiveDate: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error syncing stats to Firestore:', err);
    }
  };

  const syncAssessmentConfigToCloud = async (config: AssessmentConfig) => {
    if (!user) return;
    try {
      await upsertUserProfile(user.uid, {
        assessmentConfig: config,
      });
    } catch (err) {
      console.error('Error syncing assessment config to Firestore:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthLoading,
        isFirebaseConnected,
        signInWithGoogle,
        signInWithMicrosoft,
        signInWithDiscord,
        signInWithInstagram,
        signInWithTikTok,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        switchAccount,
        cancelSwitchAccount,
        isSwitchingAccount,
        updatePersonaInCloud,
        updateUserProfileInCloud,
        syncStatsToCloud,
        syncAssessmentConfigToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
