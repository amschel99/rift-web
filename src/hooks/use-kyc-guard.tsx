import { useState, useCallback } from "react";
import useKYCStatus from "@/hooks/data/use-kyc-status";

/**
 * Hook to guard sensitive features with KYC verification
 *
 * Usage:
 * ```tsx
 * const { checkKYC, isKYCVerified, showKYCModal, closeKYCModal, featureName } = useKYCGuard();
 *
 * const handleWithdraw = () => {
 *   if (!checkKYC("withdrawals")) return;
 *   // Proceed with withdrawal
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleWithdraw}>Withdraw</button>
 *     <KYCRequiredModal isOpen={showKYCModal} onClose={closeKYCModal} featureName={featureName} />
 *   </>
 * );
 * ```
 */
export default function useKYCGuard() {
  const { isKYCVerified, isLoading, refetch } = useKYCStatus();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [featureName, setFeatureName] = useState<string>("this feature");

  /**
   * Check if user is KYC verified before allowing access to a feature
   * @param feature - Name of the feature being accessed (for display in modal)
   * @returns true if verified, false if not (and shows modal)
   */
  const checkKYC = useCallback(
    (feature: string = "this feature"): boolean => {
      if (isKYCVerified) {
        return true;
      }

      setFeatureName(feature);
      setShowKYCModal(true);
      return false;
    },
    [isKYCVerified]
  );

  const closeKYCModal = useCallback(() => {
    setShowKYCModal(false);
  }, []);

  const openKYCModal = useCallback((feature: string = "this feature") => {
    setFeatureName(feature);
    setShowKYCModal(true);
  }, []);

  return {
    checkKYC,
    isKYCVerified,
    isLoading,
    showKYCModal,
    closeKYCModal,
    openKYCModal,
    featureName,
    refetchKYCStatus: refetch,
  };
}
