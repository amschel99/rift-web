import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { IoArrowBack, IoTrophyOutline, IoFlameOutline, IoStarOutline, IoTimeOutline } from "react-icons/io5";
import useLoyaltyStats from "@/hooks/data/use-loyalty-stats";
import useLoyaltyHistory, { LoyaltyActivity } from "@/hooks/data/use-loyalty-history";
import usePointValue from "@/hooks/data/use-point-value";
import useLeaderboard from "@/hooks/data/use-leaderboard";
import { formatNumberWithCommas } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Removed - using accent colors instead

const getTierLabel = (tier: string) => {
  return tier.replace(/_/g, " ");
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "OFFRAMP":
      return "💸";
    case "ONRAMP":
      return "💵";
    case "AIRTIME":
      return "📱";
    case "PAYMENT":
      return "💳";
    case "BLOCKCHAIN_TXN":
      return "⛓️";
    default:
      return "📊";
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case "OFFRAMP":
      return "Withdrawal";
    case "ONRAMP":
      return "Deposit";
    case "AIRTIME":
      return "Airtime Purchase";
    case "PAYMENT":
      return "Payment";
    case "BLOCKCHAIN_TXN":
      return "Blockchain Transaction";
    default:
      return type;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function Loyalty() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useLoyaltyStats();
  const { data: history, isLoading: historyLoading } = useLoyaltyHistory();
  const { data: pointValue } = usePointValue();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);

  return (
    <motion.div
      initial={{ x: -4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full h-full overflow-y-auto mb-18 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/app/profile")}
          className="p-2 hover:bg-surface-subtle rounded-full transition-colors"
        >
          <IoArrowBack className="w-5 h-5 text-text-default" />
        </button>
        <h1 className="text-2xl font-bold text-text-default">Rift Points</h1>
      </div>

      {/* Stats Section */}
      {statsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-4 mb-6">
          {/* Main Points Card */}
          <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <IoTrophyOutline className="w-6 h-6 text-white" />
              <span className="text-white/90 text-sm font-medium">
                {getTierLabel(stats.tier)}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              {formatNumberWithCommas(stats.totalPoints)}
            </h2>
            <p className="text-white/80 text-sm">
              Rift Points
              {pointValue && ` • $${(stats.totalPoints * pointValue.pointValue).toFixed(2)} USD`}
            </p>
          </div>

          {/* Point Info - Show once */}
          {pointValue && (
            <div className="bg-surface-alt border border-surface-subtle rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-subtle mb-1">Point Value</p>
                  <p className="text-xl font-bold text-text-default">
                    ${pointValue.pointValue.toFixed(2)} per point
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-subtle mb-1">Total Supply</p>
                  <p className="text-lg font-bold text-text-default">
                    {formatNumberWithCommas(pointValue.totalSupply)}
                  </p>
                  <p className="text-xs text-text-subtle mt-1">points issued</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid - Optional stats */}
          {(stats.currentStreak > 0 || stats.longestStreak > 0 || stats.transactionCount > 0 || stats.lastActivityDate) && (
            <div className="grid grid-cols-2 gap-4">
              {/* Current Streak - Only show if > 0 */}
              {stats.currentStreak > 0 && (
                <div className="bg-surface-alt border border-surface-subtle rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IoFlameOutline className="w-5 h-5 text-accent-primary" />
                    <span className="text-text-subtle text-xs">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-text-default">
                    {stats.currentStreak}
                  </p>
                  <p className="text-text-subtle text-xs mt-1">
                    days in a row
                  </p>
                </div>
              )}

              {/* Longest Streak - Only show if > 0 */}
              {stats.longestStreak > 0 && (
                <div className="bg-surface-alt border border-surface-subtle rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IoStarOutline className="w-5 h-5 text-accent-primary" />
                    <span className="text-text-subtle text-xs">Best Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-text-default">
                    {stats.longestStreak}
                  </p>
                  <p className="text-text-subtle text-xs mt-1">
                    days record
                  </p>
                </div>
              )}

              {/* Transaction Count */}
              {stats.transactionCount > 0 && (
                <div className="bg-surface-alt border border-surface-subtle rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📊</span>
                    <span className="text-text-subtle text-xs">Transactions</span>
                  </div>
                  <p className="text-2xl font-bold text-text-default">
                    {stats.transactionCount}
                  </p>
                  <p className="text-text-subtle text-xs mt-1">
                    total completed
                  </p>
                </div>
              )}

              {/* Last Activity - Only show if valid date */}
              {stats.lastActivityDate && formatDate(stats.lastActivityDate) !== "Invalid Date" && (
                <div className="bg-surface-alt border border-surface-subtle rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTimeOutline className="w-5 h-5 text-accent-primary" />
                    <span className="text-text-subtle text-xs">Last Activity</span>
                  </div>
                  <p className="text-sm font-medium text-text-default">
                    {formatDate(stats.lastActivityDate)}
                  </p>
                  <p className="text-text-subtle text-xs mt-1">
                    most recent
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <IoTrophyOutline className="w-16 h-16 text-text-subtle mx-auto mb-4 opacity-50" />
          <p className="text-text-subtle">No Rift Points yet</p>
          <p className="text-text-subtle text-sm mt-2">
            Start making transactions to earn points!
          </p>
        </div>
      )}

      {/* History Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-default mb-4">
          Earning History
        </h2>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((activity: LoyaltyActivity) => (
              <div
                key={activity.id}
                className="bg-surface-alt border border-surface-subtle rounded-lg p-4 hover:border-accent-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-default">
                        {getActivityLabel(activity.type)}
                      </p>
                      <p className="text-xs text-text-subtle mt-1">
                        ${activity.transactionValue.toFixed(2)} transaction
                        {activity.metadata?.currency && ` • ${activity.metadata.currency}`}
                      </p>
                      <p className="text-xs text-text-subtle/70 mt-1">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent-primary">
                      +{formatNumberWithCommas(activity.pointsEarned)}
                    </p>
                    <p className="text-xs text-text-subtle">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-alt border border-surface-subtle rounded-lg">
            <p className="text-text-subtle">No earning history yet</p>
            <p className="text-text-subtle text-sm mt-2">
              Complete transactions to start earning points!
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-default mb-4">
          Leaderboard
        </h2>

        {leaderboardLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="bg-surface-alt border border-surface-subtle rounded-lg p-4 flex items-center justify-between hover:border-accent-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 font-bold text-accent-primary">
                    #{entry.rank}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-default">
                      {entry.userId.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-text-subtle">
                      {getTierLabel(entry.tier)} • ${formatNumberWithCommas(entry.totalVolume)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent-primary">
                    {formatNumberWithCommas(entry.totalPoints)}
                  </p>
                  <p className="text-xs text-text-subtle">points</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-alt border border-surface-subtle rounded-lg">
            <p className="text-text-subtle text-sm">No leaderboard data yet</p>
          </div>
        )}
      </div>

      {/* Info Card - Updated messaging */}
      <div className="mt-8 mb-6 bg-surface-alt border border-surface-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-default mb-2">
          How Rift Points Work
        </h3>
        <ul className="text-xs text-text-subtle space-y-2">
          <li>• Earn ${pointValue?.pointValue.toFixed(2) || '0.05'} in points per $1 spent (5% cashback)</li>
          <li>• Use points to pay for transactions within the app</li>
          <li>• Access exclusive yield-generating products (coming soon!)</li>
          <li>• Redeem points for cash at any time</li>
          <li>• Higher tiers get bigger multipliers for more points</li>
        </ul>
      </div>
    </motion.div>
  );
}

