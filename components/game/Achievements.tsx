import React, { useMemo } from 'react';
import './Achievements.css';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward: number;
  type: 'clicks' | 'upgrades' | 'prestiges' | 'earned';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-click',
    name: 'First Click',
    description: 'Click the brick 1 time',
    requirement: 1,
    reward: 50,
    type: 'clicks',
  },
  {
    id: 'century-clicker',
    name: 'Century Clicker',
    description: 'Click the brick 100 times',
    requirement: 100,
    reward: 500,
    type: 'clicks',
  },
  {
    id: 'click-master',
    name: 'Click Master',
    description: 'Click the brick 1,000 times',
    requirement: 1000,
    reward: 2500,
    type: 'clicks',
  },
  {
    id: 'investor',
    name: 'Investor',
    description: 'Purchase your first upgrade',
    requirement: 1,
    reward: 100,
    type: 'upgrades',
  },
  {
    id: 'portfolio-builder',
    name: 'Portfolio Builder',
    description: 'Max out all upgrades',
    requirement: -1, // Will be compared against maxUpgrades
    reward: 10000,
    type: 'upgrades',
  },
  {
    id: 'exit-scam',
    name: 'Exit Scam',
    description: 'Prestige for the first time',
    requirement: 1,
    reward: 1000,
    type: 'prestiges',
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Earn 1,000,000 total',
    requirement: 1000000,
    reward: 5000,
    type: 'earned',
  },
  {
    id: 'billionaire',
    name: 'Billionaire',
    description: 'Earn 1,000,000,000 total',
    requirement: 1000000000,
    reward: 50000,
    type: 'earned',
  },
];

export interface GameStats {
  clicks: number;
  upgrades: number;
  prestiges: number;
  totalEarned: number;
  maxUpgrades: number;
}

export interface AchievementsProps {
  stats: GameStats;
  unlocked: string[];
  onClaim: (id: string, reward: number) => void;
}

interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  isUnlocked: boolean;
  isClaimed: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
};

const getProgressValue = (achievement: Achievement, stats: GameStats): number => {
  switch (achievement.type) {
    case 'clicks':
      return stats.clicks;
    case 'upgrades':
      return stats.upgrades;
    case 'prestiges':
      return stats.prestiges;
    case 'earned':
      return stats.totalEarned;
    default:
      return 0;
  }
};

const isAchievementUnlocked = (achievement: Achievement, stats: GameStats): boolean => {
  const progress = getProgressValue(achievement, stats);
  
  if (achievement.id === 'portfolio-builder') {
    // Special case: max upgrades
    return stats.upgrades >= stats.maxUpgrades && stats.maxUpgrades > 0;
  }
  
  return progress >= achievement.requirement;
};

const getProgressPercentage = (achievement: Achievement, stats: GameStats): number => {
  if (achievement.id === 'portfolio-builder') {
    const progress = stats.maxUpgrades > 0 ? (stats.upgrades / stats.maxUpgrades) * 100 : 0;
    return Math.min(progress, 100);
  }
  
  const current = getProgressValue(achievement, stats);
  const percentage = (current / achievement.requirement) * 100;
  return Math.min(percentage, 100);
};

export const Achievements: React.FC<AchievementsProps> = ({ stats, unlocked = [], onClaim }) => {
  const achievementsProgress: AchievementProgress[] = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      const isUnlocked = isAchievementUnlocked(achievement, stats);
      const isClaimed = unlocked.includes(achievement.id);
      const progress = getProgressPercentage(achievement, stats);

      return {
        achievement,
        progress,
        isUnlocked,
        isClaimed,
      };
    });
  }, [stats, unlocked]);

  const unlockedCount = achievementsProgress.filter((a) => a.isUnlocked).length;
  const claimedCount = achievementsProgress.filter((a) => a.isClaimed).length;
  const totalRewards = achievementsProgress
    .filter((a) => a.isUnlocked && !a.isClaimed)
    .reduce((sum, a) => sum + a.achievement.reward, 0);

  const handleClaimAll = () => {
    achievementsProgress.forEach(({ achievement, isUnlocked, isClaimed }) => {
      if (isUnlocked && !isClaimed) {
        onClaim(achievement.id, achievement.reward);
      }
    });
  };

  const canClaimAny = achievementsProgress.some((a) => a.isUnlocked && !a.isClaimed);

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2>Achievements</h2>
        <div className="achievements-stats">
          <span className="achievements-progress-text">
            {unlockedCount} / {ACHIEVEMENTS.length} Unlocked
          </span>
          <span className="achievements-claimed-text">
            {claimedCount} Claimed
          </span>
        </div>
        {canClaimAny && (
          <button
            className="claim-all-button"
            onClick={handleClaimAll}
          >
            Claim All ({formatNumber(totalRewards)})
          </button>
        )}
      </div>

      <div className="achievements-grid">
        {achievementsProgress.map(({ achievement, progress, isUnlocked, isClaimed }) => {
          const currentValue = getProgressValue(achievement, stats);
          const displayTarget = achievement.id === 'portfolio-builder' 
            ? stats.maxUpgrades 
            : achievement.requirement;

          return (
            <div
              key={achievement.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isClaimed ? 'claimed' : ''}`}
            >
              <div className="achievement-icon">
                {isUnlocked ? '🏆' : '🔒'}
              </div>
              
              <div className="achievement-info">
                <h3 className="achievement-name">{achievement.name}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                {!isClaimed && (
                  <div className="achievement-progress-bar">
                    <div
                      className="achievement-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                
                <div className="achievement-progress-text">
                  {isClaimed ? (
                    <span className="claimed-text">✓ Claimed</span>
                  ) : (
                    <span>
                      {formatNumber(currentValue)} / {formatNumber(displayTarget)}
                    </span>
                  )}
                </div>
              </div>

              <div className="achievement-reward">
                <span className="reward-amount">+{formatNumber(achievement.reward)}</span>
                <span className="reward-label">bricks</span>
              </div>

              {isUnlocked && !isClaimed && (
                <button
                  className="claim-button"
                  onClick={() => onClaim(achievement.id, achievement.reward)}
                >
                  Claim
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
