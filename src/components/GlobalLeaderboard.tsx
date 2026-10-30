import React from 'react';
import { UserStats, PersonaType } from '../types/quiz';
import {
  GlobalScholarsLeaderboard,
  LeaderboardUser as GlobalScholarLeaderboardUser,
  SCHOLAR_REGIONS,
  REGIONAL_SCHOOLS_DIRECTORY,
  ScholarRegionId,
} from './GlobalScholarsLeaderboard';

export type LeaderboardUser = GlobalScholarLeaderboardUser;
export { SCHOLAR_REGIONS, REGIONAL_SCHOOLS_DIRECTORY, GlobalScholarsLeaderboard };
export type { ScholarRegionId };

interface GlobalLeaderboardProps {
  stats: UserStats;
  persona: PersonaType;
  onStartPracticeQuiz?: () => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  stats,
  persona,
  onStartPracticeQuiz,
}) => {
  return (
    <GlobalScholarsLeaderboard
      stats={stats}
      persona={persona}
      onStartPracticeQuiz={onStartPracticeQuiz}
    />
  );
};
