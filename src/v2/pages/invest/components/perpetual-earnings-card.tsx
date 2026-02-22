import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { DollarSign, TrendingUp } from "lucide-react";
import { IoChevronForward } from "react-icons/io5";
import useDesktopDetection from "@/hooks/use-desktop-detection";
import { useReferralFeeBalance } from "@/hooks/data/use-referral-fees";

export default function PerpetualEarningsCard() {
  const { data: balance, isLoading } = useReferralFeeBalance();
  const isDesktop = useDesktopDetection();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-surface-alt border border-surface-subtle rounded-2xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-surface rounded-full" />
            <div className="h-3 w-44 bg-surface rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate("/app/invest/perpetual-earnings")}
      className={`bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform ${
        isDesktop ? "hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-text-default">
              Referral Earnings
            </p>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-700 rounded-full">
              FOREVER
            </span>
          </div>

          <p className="text-xs text-text-subtle">
            Earn 0.3% on every transaction your friends make
          </p>

          {/* Balance preview */}
          {balance && balance.totalUsd > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-700">
                  ${balance.totalUsd.toFixed(2)} unclaimed
                </span>
              </div>
              {balance.canClaim && (
                <span className="text-[10px] font-medium text-emerald-600">
                  Claim now
                </span>
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
