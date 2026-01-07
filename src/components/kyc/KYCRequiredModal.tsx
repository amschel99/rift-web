import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { FiShield, FiX } from "react-icons/fi";
import ActionButton from "@/components/ui/action-button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function KYCRequiredModal({
  isOpen,
  onClose,
  featureName = "this feature",
}: Props) {
  const navigate = useNavigate();

  const handleVerifyNow = () => {
    onClose();
    // Navigate to KYC flow - you can adjust this path based on your routing
    navigate("/kyc");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-app-background rounded-2xl shadow-xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <FiX className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <FiShield className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>

                {/* Title & Description */}
                <h2 className="text-xl font-bold text-center mb-3">
                  Verification Required
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  To access {featureName}, you need to complete identity
                  verification (KYC). This helps us keep your account secure and
                  comply with regulations.
                </p>

                {/* Benefits */}
                <div className="bg-surface-secondary rounded-xl p-4 mb-6 space-y-2">
                  <p className="text-sm font-medium mb-2">
                    ✨ Benefits of verification:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Access to all payment features</li>
                    <li>• Higher transaction limits</li>
                    <li>• Enhanced account security</li>
                    <li>• Faster withdrawal processing</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <ActionButton onClick={handleVerifyNow} className="w-full">
                    <FiShield className="w-4 h-4 mr-2" />
                    Verify Now
                  </ActionButton>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-text-default transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Info */}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  🔒 Verification takes less than 2 minutes
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
