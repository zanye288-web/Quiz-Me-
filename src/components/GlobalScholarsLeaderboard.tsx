import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Crown,
  TrendingUp,
  Award,
  Zap,
  Globe,
  Search,
  Building2,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  BookOpen,
  Target,
  Users,
  X,
  Edit3,
} from 'lucide-react';
import { UserStats, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { fetchLeaderboardUsers } from '../services/firestore';
import { getWeeklyImprovementScoreForCurrentUser } from '../utils/adaptiveLearningEngine';

export type ScholarRegionId =
  | 'ALL'
  | 'West Africa'
  | 'United Kingdom'
  | 'North America'
  | 'Europe & International'
  | 'East & Southern Africa'
  | 'Asia-Pacific & Middle East';

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  persona: PersonaType;
  level: number;
  xp: number;
  streak: number;
  accuracy: number;
  quizMastery?: number;
  quizzesCompleted?: number;
  school?: string;
  region?: Exclude<ScholarRegionId, 'ALL'> | string;
  examBoardFocus?: string;
  topSubjects?: string[];
  tier: 'Diamond' | 'Master' | 'Gold' | 'Silver' | 'Bronze';
  badgeTitle: string;
  countryCode?: string;
  isCurrentUser?: boolean;
  weeklyMasteryGained?: number;
  weeklyMistakesFixed?: number;
  weeklyImprovementIndex?: number;
}

export interface GlobalScholarsLeaderboardProps {
  stats: UserStats;
  persona: PersonaType;
  onStartPracticeQuiz?: () => void;
}

export const SCHOLAR_REGIONS: Array<{
  id: ScholarRegionId;
  label: string;
  shortLabel: string;
  examBoards: string;
}> = [
  {
    id: 'ALL',
    label: 'All Regions (Worldwide)',
    shortLabel: 'All Regions',
    examBoards: 'All Global Boards',
  },
  {
    id: 'West Africa',
    label: 'West Africa (Nigeria · Ghana · Sierra Leone · Gambia)',
    shortLabel: 'West Africa',
    examBoards: 'WAEC · JAMB · NECO · Checkpoint',
  },
  {
    id: 'United Kingdom',
    label: 'United Kingdom',
    shortLabel: 'United Kingdom',
    examBoards: 'GCSE · IGCSE · A-Level',
  },
  {
    id: 'North America',
    label: 'North America (USA · Canada)',
    shortLabel: 'North America',
    examBoards: 'SAT · ACT · AP',
  },
  {
    id: 'Europe & International',
    label: 'Europe & International Schools',
    shortLabel: 'Europe & Intl',
    examBoards: 'IGCSE · IB Diploma · Checkpoint',
  },
  {
    id: 'East & Southern Africa',
    label: 'East & Southern Africa (Kenya · South Africa · Uganda)',
    shortLabel: 'East & South Africa',
    examBoards: 'KCSE · NSC · Cambridge',
  },
  {
    id: 'Asia-Pacific & Middle East',
    label: 'Asia-Pacific & Middle East (Singapore · UAE · India)',
    shortLabel: 'Asia-Pacific & MENA',
    examBoards: 'GCE O/A-Level · CBSE · IGCSE',
  },
];

export const REGIONAL_SCHOOLS_DIRECTORY: Record<
  Exclude<ScholarRegionId, 'ALL'>,
  Array<{ name: string; city: string; countryCode: string; examBoardFocus: string }>
> = {
  'West Africa': [
    { name: "King's College Lagos", city: 'Lagos, Nigeria', countryCode: 'NG', examBoardFocus: 'WAEC & JAMB' },
    { name: "Queen's College Yaba", city: 'Lagos, Nigeria', countryCode: 'NG', examBoardFocus: 'WAEC & JAMB' },
    { name: 'Loyola Jesuit College', city: 'Abuja, Nigeria', countryCode: 'NG', examBoardFocus: 'WAEC, JAMB & IGCSE' },
    { name: 'Achimota School', city: 'Accra, Ghana', countryCode: 'GH', examBoardFocus: 'WASSCE & Cambridge' },
    { name: 'Prempeh College', city: 'Kumasi, Ghana', countryCode: 'GH', examBoardFocus: 'WASSCE' },
    { name: 'Corona Secondary School', city: 'Agbara, Nigeria', countryCode: 'NG', examBoardFocus: 'IGCSE, Checkpoint & WAEC' },
    { name: 'Atlantic Hall School', city: 'Epe, Lagos', countryCode: 'NG', examBoardFocus: 'Cambridge Checkpoint & WAEC' },
    { name: 'Lifeforte International High School', city: 'Ibadan, Nigeria', countryCode: 'NG', examBoardFocus: 'IGCSE & Checkpoint' },
  ],
  'United Kingdom': [
    { name: 'Brampton Manor Academy', city: 'London, UK', countryCode: 'GB', examBoardFocus: 'GCSE & A-Level' },
    { name: 'Westminster School', city: 'London, UK', countryCode: 'GB', examBoardFocus: 'GCSE & A-Level' },
    { name: "St Paul's Girls' School", city: 'London, UK', countryCode: 'GB', examBoardFocus: 'GCSE & IGCSE' },
    { name: 'King Edward VI Camp Hill', city: 'Birmingham, UK', countryCode: 'GB', examBoardFocus: 'GCSE & A-Level' },
    { name: 'Eton College', city: 'Windsor, UK', countryCode: 'GB', examBoardFocus: 'GCSE & A-Level' },
  ],
  'North America': [
    { name: 'Stuyvesant High School', city: 'New York, USA', countryCode: 'US', examBoardFocus: 'SAT & AP' },
    { name: 'Thomas Jefferson High School for Science & Tech', city: 'Alexandria, USA', countryCode: 'US', examBoardFocus: 'SAT & AP' },
    { name: 'Phillips Exeter Academy', city: 'Exeter, USA', countryCode: 'US', examBoardFocus: 'SAT & AP' },
    { name: 'Bronx High School of Science', city: 'New York, USA', countryCode: 'US', examBoardFocus: 'SAT & AP' },
    { name: 'Upper Canada College', city: 'Toronto, Canada', countryCode: 'CA', examBoardFocus: 'IB & AP' },
  ],
  'Europe & International': [
    { name: 'International School of Geneva', city: 'Geneva, Switzerland', countryCode: 'CH', examBoardFocus: 'IB & IGCSE' },
    { name: 'United World College Maastricht', city: 'Maastricht, Netherlands', countryCode: 'NL', examBoardFocus: 'IB & Checkpoint' },
    { name: 'British International School Cairo', city: 'Cairo, Egypt', countryCode: 'EG', examBoardFocus: 'Cambridge Checkpoint & IGCSE' },
    { name: 'Frankfurt International School', city: 'Oberursel, Germany', countryCode: 'DE', examBoardFocus: 'IB & IGCSE' },
  ],
  'East & Southern Africa': [
    { name: 'Alliance High School', city: 'Kikuyu, Kenya', countryCode: 'KE', examBoardFocus: 'KCSE & Cambridge' },
    { name: 'Kenya High School', city: 'Nairobi, Kenya', countryCode: 'KE', examBoardFocus: 'KCSE & IGCSE' },
    { name: 'Bishops Diocesan College', city: 'Cape Town, South Africa', countryCode: 'ZA', examBoardFocus: 'NSC & Cambridge' },
    { name: 'King Edward VII School', city: 'Johannesburg, South Africa', countryCode: 'ZA', examBoardFocus: 'NSC & IEB' },
  ],
  'Asia-Pacific & Middle East': [
    { name: 'Raffles Institution', city: 'Singapore', countryCode: 'SG', examBoardFocus: 'Cambridge GCE & Olympiad' },
    { name: 'Hwa Chong Institution', city: 'Singapore', countryCode: 'SG', examBoardFocus: 'Cambridge GCE A-Level' },
    { name: 'Dubai College', city: 'Dubai, UAE', countryCode: 'AE', examBoardFocus: 'GCSE & A-Level' },
    { name: 'Delhi Public School RK Puram', city: 'New Delhi, India', countryCode: 'IN', examBoardFocus: 'CBSE & AP' },
  ],
};

const USER_AFFILIATION_STORAGE_KEY = 'quizme_scholar_affiliation_v1';

interface SavedAffiliation {
  school: string;
  region: Exclude<ScholarRegionId, 'ALL'>;
}

function getDefaultAffiliation(): SavedAffiliation {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(USER_AFFILIATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.school && parsed.region) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  // No school is assumed: the user picks their own in the affiliation editor.
  return {
    school: '',
    region: 'West Africa',
  };
}

/**
 * Computes a normalized 0–100 Quiz Mastery percentage from accuracy, completed quizzes, and weekly mastery growth.
 */
export function computeQuizMasteryScore(
  accuracy: number,
  quizzesCompleted: number,
  weeklyMasteryGained: number = 0
): number {
  const safeAcc = Math.max(0, Math.min(100, accuracy || 0));
  const volumeBonus = Math.min(20, (quizzesCompleted || 0) * 2);
  const growthBonus = Math.min(10, Math.round((weeklyMasteryGained || 0) * 0.3));
  const raw = Math.round(safeAcc * 0.72 + volumeBonus + growthBonus);
  return Math.max(12, Math.min(100, raw));
}

/**
 * Computes a unified Combined Scholar Score balancing XP and Quiz Mastery %.
 */
export function computeCombinedScholarScore(xp: number, quizMastery: number): number {
  return Math.round((xp || 0) + (quizMastery || 0) * 18);
}

export const GlobalScholarsLeaderboard: React.FC<GlobalScholarsLeaderboardProps> = ({
  stats,
  persona,
  onStartPracticeQuiz,
}) => {
  const { user, userProfile, updateUserProfileInCloud } = useAuth();

  // Primary Controls State
  const [viewMode, setViewMode] = useState<'scholars' | 'schools'>('scholars');
  const [rankingMetric, setRankingMetric] = useState<'combined' | 'xp' | 'mastery' | 'improvement'>('combined');
  const [selectedRegion, setSelectedRegion] = useState<ScholarRegionId>('ALL');
  const [selectedSchool, setSelectedSchool] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'Diamond' | 'Master' | 'Gold' | 'Silver' | 'Bronze'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMySchool, setOnlyMySchool] = useState<boolean>(false);

  // User's Own School & Region Affiliation State
  const [myAffiliation, setMyAffiliation] = useState<SavedAffiliation>(() => getDefaultAffiliation());
  const [isEditingAffiliation, setIsEditingAffiliation] = useState<boolean>(false);
  const [draftRegion, setDraftRegion] = useState<Exclude<ScholarRegionId, 'ALL'>>(myAffiliation.region);
  const [draftSchool, setDraftSchool] = useState<string>(myAffiliation.school);
  const [customSchoolInput, setCustomSchoolInput] = useState<string>('');
  const [affiliationSaveFeedback, setAffiliationSaveFeedback] = useState<string | null>(null);

  // Expanded scholar row & cheers
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [cheeredIds, setCheeredIds] = useState<Record<string, number>>({});
  const [cloudUsers, setCloudUsers] = useState<LeaderboardUser[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);

  const userImprovement = getWeeklyImprovementScoreForCurrentUser();

  // Sync userProfile school/region if stored in Firestore
  useEffect(() => {
    if (userProfile?.school || userProfile?.region) {
      const validRegion = (userProfile.region as Exclude<ScholarRegionId, 'ALL'>) || myAffiliation.region;
      const validSchool = userProfile.school || myAffiliation.school;
      setMyAffiliation({
        school: validSchool,
        region: validRegion,
      });
      setDraftRegion(validRegion);
      setDraftSchool(validSchool);
    }
  }, [userProfile?.school, userProfile?.region]);

  // Fetch live users from Firestore
  useEffect(() => {
    let isMounted = true;
    fetchLeaderboardUsers(user?.uid)
      .then((users) => {
        if (isMounted) {
          setCloudUsers(users);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingLeaderboard(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Current User live entry
  const currentUserAccuracy =
    stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 100;

  const currentUserQuizMastery = computeQuizMasteryScore(
    currentUserAccuracy,
    stats.quizzesCompleted,
    userImprovement.masteryGained
  );

  const currentUserName = userProfile?.displayName || user?.displayName || 'You (Scholar)';
  const currentUserAvatar =
    user?.photoURL ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.uid || 'current_user')}`;

  const currentUserItem: LeaderboardUser = {
    rank: 1,
    id: user?.uid || 'current_user',
    name: currentUserName.includes('(You)') ? currentUserName : `${currentUserName} (You)`,
    avatar: currentUserAvatar,
    persona,
    level: stats.level,
    xp: stats.xp,
    streak: stats.streak,
    accuracy: currentUserAccuracy,
    quizMastery: currentUserQuizMastery,
    quizzesCompleted: stats.quizzesCompleted || 0,
    school: myAffiliation.school,
    region: myAffiliation.region,
    examBoardFocus:
      SCHOLAR_REGIONS.find((r) => r.id === myAffiliation.region)?.examBoards || 'WAEC · IGCSE · SAT',
    topSubjects: ['Mathematics', 'Sciences', 'English Language'],
    tier:
      stats.xp >= 2200
        ? 'Diamond'
        : stats.xp >= 1500
        ? 'Master'
        : stats.xp >= 800
        ? 'Gold'
        : stats.xp >= 300
        ? 'Silver'
        : 'Bronze',
    badgeTitle: stats.level >= 5 ? 'Distinction Scholar' : 'Rising Scholar',
    countryCode: 'YOU',
    isCurrentUser: true,
    weeklyMasteryGained: userImprovement.masteryGained,
    weeklyMistakesFixed: userImprovement.mistakesFixed,
    weeklyImprovementIndex: userImprovement.improvementIndex,
  };

  // Live Firestore public_profiles plus the current user
  const allScholarsMerged = useMemo(() => {
    // Only real, signed-up users appear here. Fields a user has not provided stay empty
    // instead of being invented.
    const normalizedCloud = cloudUsers
      .filter((u) => !u.isCurrentUser && (user ? u.id !== user.uid : true))
      .map((u) => {
        const masteryGained = u.weeklyMasteryGained ?? 0;
        const mistakesFixed = u.weeklyMistakesFixed ?? 0;
        const quizzesCompleted = u.quizzesCompleted ?? 0;
        const quizMastery =
          u.quizMastery ??
          (quizzesCompleted > 0 ? computeQuizMasteryScore(u.accuracy, quizzesCompleted, masteryGained) : 0);

        return {
          ...u,
          school: u.school || '',
          region: (u.region as Exclude<ScholarRegionId, 'ALL'>) || undefined,
          countryCode: u.countryCode || '',
          examBoardFocus: u.examBoardFocus || '',
          topSubjects: u.topSubjects || [],
          quizMastery,
          quizzesCompleted,
          weeklyMasteryGained: masteryGained,
          weeklyMistakesFixed: mistakesFixed,
          weeklyImprovementIndex: u.weeklyImprovementIndex ?? masteryGained * 4 + mistakesFixed * 15,
        };
      });

    const combined = [...normalizedCloud, currentUserItem];

    // Sort according to active rankingMetric
    combined.sort((a, b) => {
      if (rankingMetric === 'xp') {
        return b.xp - a.xp || (b.quizMastery || 0) - (a.quizMastery || 0);
      }
      if (rankingMetric === 'mastery') {
        return (b.quizMastery || 0) - (a.quizMastery || 0) || b.xp - a.xp;
      }
      if (rankingMetric === 'improvement') {
        return (b.weeklyImprovementIndex || 0) - (a.weeklyImprovementIndex || 0) || b.xp - a.xp;
      }
      // 'combined': XP + Quiz Mastery weighted score
      return (
        computeCombinedScholarScore(b.xp, b.quizMastery || b.accuracy) -
        computeCombinedScholarScore(a.xp, a.quizMastery || a.accuracy)
      );
    });

    return combined.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [cloudUsers, currentUserItem, rankingMetric, user]);

  // Available schools for the selected region (including any custom user schools)
  const availableSchoolsForFilter = useMemo(() => {
    const schoolSet = new Set<string>();
    if (selectedRegion === 'ALL') {
      Object.values(REGIONAL_SCHOOLS_DIRECTORY).forEach((list) =>
        list.forEach((s) => schoolSet.add(s.name))
      );
    } else {
      (REGIONAL_SCHOOLS_DIRECTORY[selectedRegion] || []).forEach((s) => schoolSet.add(s.name));
    }
    allScholarsMerged.forEach((u) => {
      if (u.school && (selectedRegion === 'ALL' || u.region === selectedRegion)) {
        schoolSet.add(u.school);
      }
    });
    return Array.from(schoolSet).sort();
  }, [selectedRegion, allScholarsMerged]);

  // Reset selectedSchool if it doesn't belong to newly selected region
  useEffect(() => {
    if (
      selectedSchool !== 'ALL' &&
      !availableSchoolsForFilter.includes(selectedSchool)
    ) {
      setSelectedSchool('ALL');
    }
  }, [selectedRegion, availableSchoolsForFilter, selectedSchool]);

  // Compute current user's Global, Regional, and School ranks
  const userStandingsSummary = useMemo(() => {
    const globalRank = allScholarsMerged.find((u) => u.isCurrentUser)?.rank || 1;
    const regionalPeers = allScholarsMerged.filter((u) => u.region === myAffiliation.region);
    const regionalRank = Math.max(1, regionalPeers.findIndex((u) => u.isCurrentUser) + 1);
    const schoolPeers = allScholarsMerged.filter((u) => u.school === myAffiliation.school);
    const schoolRank = Math.max(1, schoolPeers.findIndex((u) => u.isCurrentUser) + 1);

    return {
      globalRank,
      totalGlobal: allScholarsMerged.length,
      regionalRank,
      totalRegional: regionalPeers.length,
      schoolRank,
      totalSchool: schoolPeers.length,
    };
  }, [allScholarsMerged, myAffiliation]);

  // Filtered scholars list based on Region, School, Tier, "My School Only", and Search Query
  const filteredScholars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = allScholarsMerged.filter((scholar) => {
      if (onlyMySchool && scholar.school !== myAffiliation.school) {
        return false;
      }
      if (selectedRegion !== 'ALL' && scholar.region !== selectedRegion) {
        return false;
      }
      if (selectedSchool !== 'ALL' && scholar.school !== selectedSchool) {
        return false;
      }
      if (tierFilter !== 'ALL' && scholar.tier !== tierFilter) {
        return false;
      }
      if (q) {
        const matchesName = scholar.name.toLowerCase().includes(q);
        const matchesSchool = (scholar.school || '').toLowerCase().includes(q);
        const matchesRegion = (scholar.region || '').toLowerCase().includes(q);
        const matchesExam = (scholar.examBoardFocus || '').toLowerCase().includes(q);
        const matchesSubject = (scholar.topSubjects || []).some((s) =>
          s.toLowerCase().includes(q)
        );
        return matchesName || matchesSchool || matchesRegion || matchesExam || matchesSubject;
      }
      return true;
    });

    // Re-index filtered display rank so filtered view shows #1, #2, #3 within that school/region alongside global rank
    return list.map((item, idx) => ({
      ...item,
      filteredRank: idx + 1,
    }));
  }, [
    allScholarsMerged,
    onlyMySchool,
    myAffiliation.school,
    selectedRegion,
    selectedSchool,
    tierFilter,
    searchQuery,
  ]);

  // Aggregated School Standings for "Top Schools & Institutions" view
  const schoolStandings = useMemo(() => {
    const map: Record<
      string,
      {
        schoolName: string;
        region: string;
        examBoardFocus: string;
        scholarsCount: number;
        totalXp: number;
        avgMasterySum: number;
        topScholarName: string;
        topScholarXp: number;
        containsCurrentUser: boolean;
      }
    > = {};

    allScholarsMerged.forEach((scholar) => {
      if (!scholar.school) return; // scholars without a school are not grouped into a fake one
      const sName = scholar.school;
      if (selectedRegion !== 'ALL' && scholar.region !== selectedRegion) {
        return;
      }
      const q = searchQuery.trim().toLowerCase();
      if (
        q &&
        !sName.toLowerCase().includes(q) &&
        !(scholar.region || '').toLowerCase().includes(q) &&
        !scholar.name.toLowerCase().includes(q)
      ) {
        return;
      }

      if (!map[sName]) {
        map[sName] = {
          schoolName: sName,
          region: scholar.region || '',
          examBoardFocus: scholar.examBoardFocus || '',
          scholarsCount: 0,
          totalXp: 0,
          avgMasterySum: 0,
          topScholarName: scholar.name,
          topScholarXp: scholar.xp,
          containsCurrentUser: false,
        };
      }

      const entry = map[sName];
      entry.scholarsCount += 1;
      entry.totalXp += scholar.xp;
      entry.avgMasterySum += scholar.quizMastery || scholar.accuracy;
      if (scholar.xp > entry.topScholarXp) {
        entry.topScholarXp = scholar.xp;
        entry.topScholarName = scholar.name;
      }
      if (scholar.isCurrentUser) {
        entry.containsCurrentUser = true;
      }
    });

    const list = Object.values(map).map((item) => {
      const avgMastery = Math.round(item.avgMasterySum / Math.max(1, item.scholarsCount));
      const combinedScore = computeCombinedScholarScore(item.totalXp, avgMastery);
      return {
        ...item,
        avgMastery,
        combinedScore,
      };
    });

    list.sort((a, b) => {
      if (rankingMetric === 'mastery') {
        return b.avgMastery - a.avgMastery || b.totalXp - a.totalXp;
      }
      if (rankingMetric === 'xp') {
        return b.totalXp - a.totalXp;
      }
      return b.combinedScore - a.combinedScore;
    });

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [allScholarsMerged, selectedRegion, searchQuery, rankingMetric]);

  const handleSaveAffiliation = async () => {
    soundFx.playCorrect();
    const chosenSchool =
      customSchoolInput.trim().length > 1 ? customSchoolInput.trim() : draftSchool;
    const nextAffiliation: SavedAffiliation = {
      school: chosenSchool,
      region: draftRegion,
    };

    setMyAffiliation(nextAffiliation);
    try {
      localStorage.setItem(USER_AFFILIATION_STORAGE_KEY, JSON.stringify(nextAffiliation));
    } catch {
      // ignore storage errors
    }

    if (user) {
      try {
        await updateUserProfileInCloud({
          school: nextAffiliation.school,
          region: nextAffiliation.region,
          quizMasteryScore: currentUserQuizMastery,
        });
      } catch {
        // non-blocking cloud update
      }
    }

    setCustomSchoolInput('');
    setIsEditingAffiliation(false);
    setAffiliationSaveFeedback(`Updated school to ${nextAffiliation.school} (${nextAffiliation.region})`);
    setTimeout(() => setAffiliationSaveFeedback(null), 3500);
  };

  const handleCheer = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playCorrect();
    setCheeredIds((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + 1,
    }));
  };

  const resetAllFilters = () => {
    soundFx.playClick();
    setSelectedRegion('ALL');
    setSelectedSchool('ALL');
    setTierFilter('ALL');
    setOnlyMySchool(false);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedRegion !== 'ALL' ||
    selectedSchool !== 'ALL' ||
    tierFilter !== 'ALL' ||
    onlyMySchool ||
    searchQuery.trim().length > 0;

  return (
    <section
      id="global-leaderboard-component"
      aria-label="Global Scholars Leaderboard"
      className="w-full max-w-6xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-7 space-y-6 transition-colors"
    >
      {/* 1. Header & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Globe className="w-4 h-4 shrink-0" />
            <span>Academic Standings</span>
            <span aria-hidden="true">·</span>
            <span>XP &amp; Quiz Mastery Rankings</span>
            <span aria-hidden="true">·</span>
            <span>School &amp; Regional Divisions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Global Scholars Leaderboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Compare top scholars worldwide based on cumulative Experience Points (XP) and verified Quiz Mastery across schools, exam boards, and geographic regions.
          </p>
        </div>

        {/* Individual Scholars vs School Rankings Segmented Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div
            role="tablist"
            aria-label="Leaderboard View Mode"
            className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'scholars'}
              onClick={() => {
                soundFx.playClick();
                setViewMode('scholars');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                viewMode === 'scholars'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Top Scholars ({filteredScholars.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'schools'}
              onClick={() => {
                soundFx.playClick();
                setViewMode('schools');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                viewMode === 'schools'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>School Standings ({schoolStandings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Current User ("You") Standing & School/Region Affiliation Card */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* User Identity & School/Region Affiliation */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <img
              src={currentUserItem.avatar}
              alt={currentUserItem.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {currentUserItem.name}
                </span>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {currentUserItem.tier} Division · Level {stats.level}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{myAffiliation.school}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{myAffiliation.region}</span>
                </span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setDraftRegion(myAffiliation.region);
                    setDraftSchool(myAffiliation.school);
                    setIsEditingAffiliation((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingAffiliation ? 'Cancel Edit' : 'Change School / Region'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Ranks & Metrics Strip (Tabular Numerals) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-700/80">
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Global Rank</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                #{userStandingsSummary.globalRank}
                <span className="text-xs font-normal text-slate-400">/{userStandingsSummary.totalGlobal}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Regional Rank</div>
              <div className="text-sm font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                #{userStandingsSummary.regionalRank}
                <span className="text-xs font-normal text-slate-400">/{userStandingsSummary.totalRegional}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">School Rank</div>
              <div className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                #{userStandingsSummary.schoolRank}
                <span className="text-xs font-normal text-slate-400">/{userStandingsSummary.totalSchool}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Total XP</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {stats.xp.toLocaleString()} XP
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Quiz Mastery</div>
              <div className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {currentUserQuizMastery}%
              </div>
            </div>
          </div>
        </div>

        {affiliationSaveFeedback && (
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{affiliationSaveFeedback}</span>
          </div>
        )}

        {/* Inline School & Region Editor Drawer */}
        {isEditingAffiliation && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. Your Region
              </label>
              <select
                value={draftRegion}
                onChange={(e) => {
                  const nextReg = e.target.value as Exclude<ScholarRegionId, 'ALL'>;
                  setDraftRegion(nextReg);
                  const defaultFirstSchool = REGIONAL_SCHOOLS_DIRECTORY[nextReg]?.[0]?.name || '';
                  setDraftSchool(defaultFirstSchool);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SCHOLAR_REGIONS.filter((r) => r.id !== 'ALL').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Select School or Institution
              </label>
              <select
                value={draftSchool}
                onChange={(e) => {
                  setDraftSchool(e.target.value);
                  setCustomSchoolInput('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(REGIONAL_SCHOOLS_DIRECTORY[draftRegion] || []).map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Type Custom School Name
                </label>
                <input
                  type="text"
                  value={customSchoolInput}
                  onChange={(e) => setCustomSchoolInput(e.target.value)}
                  maxLength={60}
                  placeholder="e.g. Federal Government College..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveAffiliation}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer self-end"
              >
                Save Affiliation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter & Ranking Controls Bar (Region, School, Ranking Metric, Search) */}
      <div className="space-y-3">
        {/* Region Segmented Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Filter by Region:</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedRegion(
                  selectedRegion === myAffiliation.region ? 'ALL' : myAffiliation.region
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                selectedRegion === myAffiliation.region
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              My Region ({myAffiliation.region})
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                const nextState = !onlyMySchool;
                setOnlyMySchool(nextState);
                if (nextState) {
                  setSelectedRegion('ALL');
                  setSelectedSchool(myAffiliation.school);
                } else {
                  setSelectedSchool('ALL');
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                onlyMySchool || selectedSchool === myAffiliation.school
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              My School ({myAffiliation.school})
            </button>
          </div>
        </div>

        {/* Horizontal Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SCHOLAR_REGIONS.map((region) => {
            const isSelected = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedRegion(region.id);
                  setOnlyMySchool(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {region.shortLabel}
              </button>
            );
          })}
        </div>

        {/* School Selector + Sort By Metric + Search Input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* School Dropdown Filter */}
          <div className="md:col-span-4">
            <label
              htmlFor="leaderboard-school-select"
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
            >
              School or Institution
            </label>
            <select
              id="leaderboard-school-select"
              value={selectedSchool}
              onChange={(e) => {
                soundFx.playClick();
                const val = e.target.value;
                setSelectedSchool(val);
                setOnlyMySchool(val === myAffiliation.school);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">
                All Schools ({availableSchoolsForFilter.length} Institutions)
              </option>
              {availableSchoolsForFilter.map((schoolName) => (
                <option key={schoolName} value={schoolName}>
                  {schoolName}
                  {schoolName === myAffiliation.school ? ' (Your School)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Ranking Criteria Selector */}
          <div className="md:col-span-4">
            <label
              htmlFor="leaderboard-metric-select"
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
            >
              Rank Scholars By
            </label>
            <select
              id="leaderboard-metric-select"
              value={rankingMetric}
              onChange={(e) => {
                soundFx.playClick();
                setRankingMetric(
                  e.target.value as 'combined' | 'xp' | 'mastery' | 'improvement'
                );
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="combined">Combined Score (XP + Quiz Mastery %)</option>
              <option value="xp">Highest Experience Points (Total XP)</option>
              <option value="mastery">Highest Quiz Mastery (%)</option>
              <option value="improvement">Weekly Mastery Growth Index</option>
            </select>
          </div>

          {/* Search Scholar, School, or Subject */}
          <div className="md:col-span-4">
            <label
              htmlFor="leaderboard-search-input"
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
            >
              Search Scholar, School, or Subject
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="leaderboard-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, school, WAEC, SAT, Physics..."
                className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Division Filter Bar + Active Filter Reset */}
        {viewMode === 'scholars' && (
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'Diamond', 'Master', 'Gold', 'Silver', 'Bronze'] as const).map((tier) => {
                const isSelected = tierFilter === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setTierFilter(tier);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tier === 'ALL' ? 'All Divisions' : `${tier} League`}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4A. VIEW MODE: INDIVIDUAL SCHOLARS */}
      {viewMode === 'scholars' && (
        <>
          {/* Top 3 Podium (shown when at least 3 scholars match current filter) */}
          {filteredScholars.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 items-stretch">
              {/* 2nd Place */}
              <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 order-2 sm:order-1">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={filteredScholars[1].avatar}
                      alt={filteredScholars[1].name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-600"
                    />
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-700 text-white font-mono tabular-nums font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {filteredScholars[1].name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {filteredScholars[1].school}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {filteredScholars[1].region}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {filteredScholars[1].xp.toLocaleString()} XP
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {filteredScholars[1].quizMastery ?? filteredScholars[1].accuracy}% Mastery
                  </span>
                </div>
              </div>

              {/* 1st Place (Champion) */}
              <div className="p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-300 dark:border-amber-700/70 flex flex-col justify-between space-y-3 order-1 sm:order-2">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <span className="inline-flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Top Ranked Scholar</span>
                  </span>
                  <span className="font-mono tabular-nums">#1</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <img
                    src={filteredScholars[0].avatar}
                    alt={filteredScholars[0].name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {filteredScholars[0].name}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {filteredScholars[0].school}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {filteredScholars[0].region} · {filteredScholars[0].tier} League
                    </p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {filteredScholars[0].xp.toLocaleString()} XP
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {filteredScholars[0].quizMastery ?? filteredScholars[0].accuracy}% Mastery
                  </span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 order-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={filteredScholars[2].avatar}
                      alt={filteredScholars[2].name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-600"
                    />
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-700 text-white font-mono tabular-nums font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {filteredScholars[2].name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {filteredScholars[2].school}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {filteredScholars[2].region}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {filteredScholars[2].xp.toLocaleString()} XP
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {filteredScholars[2].quizMastery ?? filteredScholars[2].accuracy}% Mastery
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scholars Standings Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            {/* Table Column Headers */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Scholar &amp; Achievement Title</div>
              <div className="col-span-3">School &amp; Region</div>
              <div className="col-span-2 text-right">Quiz Mastery</div>
              <div className="col-span-2 text-right">Total XP</div>
            </div>

            {isLoadingLeaderboard && (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                Loading live scholar standings...
              </div>
            )}

            {!isLoadingLeaderboard && filteredScholars.length === 0 && (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No scholars match the selected school or regional filter.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Try clearing your search query or switching to All Regions to view the full global standings.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Show All Global Scholars
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredScholars.map((scholar) => {
                const isUser = scholar.isCurrentUser;
                const isExpanded = expandedUserId === scholar.id;
                const cheerCount = cheeredIds[scholar.id] || 0;
                const masteryVal = scholar.quizMastery ?? scholar.accuracy;

                return (
                  <div
                    key={scholar.id}
                    id={`leaderboard-row-${scholar.id}`}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div
                      onClick={() => {
                        soundFx.playClick();
                        setExpandedUserId(isExpanded ? null : scholar.id);
                      }}
                      className="p-3.5 sm:px-4 sm:py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center cursor-pointer"
                    >
                      {/* Col 1: Rank */}
                      <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-2">
                        <span
                          className={`font-mono tabular-nums text-xs sm:text-sm font-bold ${
                            scholar.filteredRank === 1
                              ? 'text-amber-600 dark:text-amber-400'
                              : scholar.filteredRank === 2
                              ? 'text-slate-600 dark:text-slate-300'
                              : scholar.filteredRank === 3
                              ? 'text-amber-700 dark:text-amber-500'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          #{scholar.filteredRank}
                        </span>
                        {hasActiveFilters && scholar.rank !== scholar.filteredRank && (
                          <span
                            className="text-[10px] font-mono tabular-nums text-slate-400"
                            title="Global Rank"
                          >
                            (G#{scholar.rank})
                          </span>
                        )}
                      </div>

                      {/* Col 2: Scholar Identity */}
                      <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                        <img
                          src={scholar.avatar}
                          alt={scholar.name}
                          referrerPolicy="no-referrer"
                          className={`w-10 h-10 rounded-xl object-cover shrink-0 ${
                            isUser
                              ? 'ring-2 ring-indigo-600 dark:ring-indigo-400'
                              : 'border border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold truncate ${
                                isUser
                                  ? 'text-indigo-700 dark:text-indigo-300'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {scholar.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            <span className="truncate">{scholar.badgeTitle}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">Lvl {scholar.level}</span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {scholar.streak}d
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Col 3: School & Region */}
                      <div className="md:col-span-3 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {scholar.school || 'No school set'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {scholar.region || 'Worldwide'} · {scholar.tier} Division
                        </div>
                      </div>

                      {/* Col 4: Quiz Mastery Bar & Accuracy */}
                      <div className="md:col-span-2 flex md:flex-col items-center md:items-end justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                            {masteryVal}%
                          </span>
                          <span className="text-[11px] text-slate-400">Mastery</span>
                        </div>
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.max(10, masteryVal)}%` }}
                          />
                        </div>
                      </div>

                      {/* Col 5: XP & Expand/Cheer Actions */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2.5">
                        <div className="text-left md:text-right font-mono tabular-nums">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {scholar.xp.toLocaleString()} XP
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            +{scholar.weeklyImprovementIndex || 120} wk
                          </div>
                        </div>

                        {!isUser && (
                          <button
                            type="button"
                            onClick={(e) => handleCheer(scholar.id, e)}
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                            title="Commend Scholar"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            {cheerCount > 0 && (
                              <span className="font-mono tabular-nums text-[11px] font-bold">
                                {cheerCount}
                              </span>
                            )}
                          </button>
                        )}

                        <span className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Scholar Mastery Dossier */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            Academic Focus: {scholar.examBoardFocus || 'Global Standardized Assessments'}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>
                              Strongest Subjects:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {(scholar.topSubjects || ['Mathematics', 'Sciences']).join(', ')}
                              </strong>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              Accuracy: {scholar.accuracy}%
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              Quizzes Completed: {scholar.quizzesCompleted || 12}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {scholar.school && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedSchool(scholar.school || 'ALL');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Filter by {scholar.school}
                            </button>
                          )}
                          {scholar.region && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedRegion(scholar.region as ScholarRegionId);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Filter by {scholar.region}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 4B. VIEW MODE: SCHOOL STANDINGS (TOP INSTITUTIONS) */}
      {viewMode === 'schools' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">School / Institution</div>
            <div className="col-span-3">Region &amp; Exam Focus</div>
            <div className="col-span-2 text-right">Avg Quiz Mastery</div>
            <div className="col-span-2 text-right">Combined School XP</div>
          </div>

          {schoolStandings.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No schools match your current filter.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {schoolStandings.map((school) => (
                <div
                  key={school.schoolName}
                  className={`p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center transition-colors ${
                    school.containsCurrentUser
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="md:col-span-1 font-mono tabular-nums text-sm font-bold text-slate-600 dark:text-slate-300">
                    #{school.rank}
                  </div>

                  <div className="md:col-span-4 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {school.schoolName}
                      </span>
                      {school.containsCurrentUser && (
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          (Your School)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {school.scholarsCount} ranked{' '}
                      {school.scholarsCount === 1 ? 'scholar' : 'scholars'} · Lead:{' '}
                      {school.topScholarName}
                    </div>
                  </div>

                  <div className="md:col-span-3 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {school.region}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {school.examBoardFocus}
                    </div>
                  </div>

                  <div className="md:col-span-2 text-left md:text-right font-mono tabular-nums">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {school.avgMastery}%
                    </div>
                    <div className="text-[11px] text-slate-400">Avg Mastery</div>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                    <div className="text-left md:text-right font-mono tabular-nums">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {school.totalXp.toLocaleString()} XP
                      </div>
                      <div className="text-[11px] text-slate-400">School Total</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedSchool(school.schoolName);
                        setViewMode('scholars');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      View Scholars
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
