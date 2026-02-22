import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Trophy, Users } from "lucide-react";
import { IoChevronForward } from "react-icons/io5";
import useDesktopDetection from "@/hooks/use-desktop-detection";
import useWeeklyPool, {
  getCountdownToSunday,
} from "@/hooks/data/use-weekly-pool";

export default function WeeklyPoolCard() {
  const { data: pool, isLoading } = useWeeklyPool();
  const isDesktop = useDesktopDetection();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(getCountdownToSunday());

  useEffect(() => {
    const interval = setInterval(
      () => setCountdown(getCountdownToSunday()),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-surface-alt border border-surface-subtle rounded-2xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-surface rounded-full" />
            <div className="h-3 w-40 bg-surface rounded-full" />
            <div className="h-1.5 w-full bg-surface rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!pool) return null;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate("/app/invest/weekly-pool")}
      className={`bg-gradient-to-r from-accent-primary/10 to-warning/10 border border-accent-primary/20 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform ${
        isDesktop ? "hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Trophy icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-warning/30 to-warning/10 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5.5 h-5.5 text-warning" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-text-default">
              Weekly Pool
            </p>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-warning/20 text-amber-700 rounded-full">
              ${pool.prizeAmount} PRIZE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-subtle">
            <span>
              Draw in {countdown.days}d {countdown.hours}h
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {pool.totalParticipants}
            </span>
          </div>

          {/* Mini progress or qualified badge */}
          {pool.user && (
            <div className="mt-2">
              {pool.user.isQualified ? (
                <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-success/10 text-success rounded-full">
                  You're qualified!
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-primary"
                      style={{
                        width: `${pool.user.progressPercent}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-accent-primary">
                    {pool.user.progressPercent}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <IoChevronForward className="text-text-subtle flex-shrink-0" />
      </div>
    </motion.div>
  );
}
