import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import ActionButton from "@/components/ui/action-button";
import { Country } from "../types";
import { CgSpinner } from "react-icons/cg";
import useUser from "@/hooks/data/use-user";
import { ID_TYPES_BY_COUNTRY } from "../constants";

// Import Smile ID web component
import "@smileid/web-components/smart-camera-web";

interface Props {
  country: Country;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onBack?: () => void;
  apiBaseUrl: string; // Your backend API URL
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "smart-camera-web": any;
    }
  }
}

// Human-readable labels for ID types
const ID_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID",
  PASSPORT: "Passport",
  DRIVERS_LICENSE: "Driver's License",
  VOTER_ID: "Voter ID",
  BVN: "Bank Verification Number (BVN)",
  NIN: "National Identification Number (NIN)",
  SSNIT: "SSNIT",
  ALIEN_CARD: "Alien Card",
};

type Step = "id-details" | "capture" | "result";

interface VerificationResult {
  passed: boolean;
  pending: boolean;
  reason: string;
  jobId?: string;
  isSystemError?: boolean;
}

// Helper to detect if an error is a system error vs user error
const isSystemErrorMessage = (reason: string): boolean => {
  const systemErrorKeywords = [
    "temporarily unavailable",
    "service unavailable",
    "try again later",
    "network error",
    "server error",
    "timeout",
    "connection",
    "credits",
    "production not enabled",
  ];
  const lowerReason = reason.toLowerCase();
  return systemErrorKeywords.some((keyword) => lowerReason.includes(keyword));
};

export default function SmileIDVerification({
  country,
  onSuccess,
  onError,
  onBack,
  apiBaseUrl,
}: Props) {
  const [step, setStep] = useState<Step>("id-details");
  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data: user } = useUser();

  // Get available ID types for the selected country
  const availableIdTypes = ID_TYPES_BY_COUNTRY[country.code] || [
    "NATIONAL_ID",
    "PASSPORT",
  ];

  // Handle proceeding from ID details to capture
  const handleProceedToCapture = () => {
    if (!idType) {
      toast.error("Please select your ID type");
      return;
    }
    if (!idNumber.trim()) {
      toast.error("Please enter your ID number");
      return;
    }
    setStep("capture");
  };

  // Submit captured images to backend for verification
  const submitForVerification = useCallback(
    async (capturedData: any) => {
      try {
        setSubmitting(true);
        console.log(
          "📤 Submitting captured images for verification:",
          capturedData
        );

        // Prepare user identifier
        const identifier =
          user?.email || user?.phoneNumber || user?.externalId || user?.id;

        if (!identifier) {
          throw new Error(
            "No user identifier found. Please complete your profile first."
          );
        }

        // Send images to backend for Smile ID verification
        const apiKey = import.meta.env.VITE_SDK_API_KEY;
        const response = await fetch(`${apiBaseUrl}/api/kyc/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            images: capturedData.images,
            partner_params: {
              user_id: user?.id || localStorage.getItem("userId") || "",
              job_id: `job-${Date.now()}`,
              job_type: 1, // biometric_kyc
              country_code: country.code,
              id_type: idType,
              id_number: idNumber.trim(),
              identifier: identifier,
              libraryVersion: capturedData.meta?.version || "unknown",
            },
            country_code: country.code,
            id_type: idType,
            id_number: idNumber.trim(),
            user_id: user?.id,
            email: user?.email,
            phone_number: user?.phoneNumber,
            external_id: user?.externalId,
          }),
        });

        const data = await response.json();
        console.log("📥 KYC Response:", data);

        // Log debug info if present (for developers only)
        if (data._debug) {
          console.log("🔧 Debug info:", data._debug);
        }

        // All responses now have: success, passed, pending, reason, jobId
        // Use `reason` for user-friendly messages (safe to display)
        const userMessage = data.reason || "Verification failed";

        // Determine the result state
        if (data.success && data.passed) {
          // ✅ PASSED - Verification successful
          console.log("✅ KYC Passed:", userMessage);
          toast.success("Verification Complete!", {
            description: userMessage,
          });

          setVerificationResult({
            passed: true,
            pending: false,
            reason: userMessage,
            jobId: data.jobId,
          });
          setStep("result");

          // Call onSuccess after short delay to show result screen
          setTimeout(() => {
            onSuccess(data);
          }, 2000);
        } else if (data.pending) {
          // ⏳ PENDING - Under review
          console.log("⏳ KYC Pending:", userMessage);
          toast.info("Verification Under Review", {
            description: userMessage,
          });

          setVerificationResult({
            passed: false,
            pending: true,
            reason: userMessage,
            jobId: data.jobId,
          });
          setStep("result");
        } else {
          // ❌ FAILED - Verification failed (includes success: false errors)
          console.log("❌ KYC Failed:", userMessage);
          toast.error("Verification Failed", {
            description: userMessage,
          });

          // Check if this is a system error or user error
          // Use _debug.isSystemError if available, otherwise detect from message
          const systemError =
            data._debug?.isSystemError || isSystemErrorMessage(userMessage);

          setVerificationResult({
            passed: false,
            pending: false,
            reason: userMessage,
            jobId: data.jobId,
            isSystemError: systemError,
          });
          setStep("result");
        }
      } catch (err: any) {
        console.error("❌ KYC Submission Error:", err);

        // Network or unexpected error - this is always a system error
        const errorMessage = err.message || "Network error. Please try again.";
        toast.error("Verification Failed", {
          description: errorMessage,
        });

        setVerificationResult({
          passed: false,
          pending: false,
          reason: errorMessage,
          isSystemError: true, // Network errors are always system errors
        });
        setStep("result");

        onError(err);
      } finally {
        setSubmitting(false);
      }
    },
    [apiBaseUrl, country, idType, idNumber, user, onSuccess, onError]
  );

  // Use a ref to hold the latest submit function to avoid stale closures
  const submitRef = useRef(submitForVerification);
  submitRef.current = submitForVerification;

  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  // Set up event listeners for the smart-camera-web component
  // Only run when on capture step
  useEffect(() => {
    // Don't attach listeners if not on capture step
    if (step !== "capture") {
      console.log("📍 Not on capture step, skipping event listener setup");
      return;
    }

    console.log("🔧 Setting up SmileID event listeners...");

    // Handler for when images are captured and confirmed by user
    const handlePublish = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        "📸 smart-camera-web.publish event received:",
        customEvent.detail
      );
      submitRef.current(customEvent.detail);
    };

    // Handler for when user cancels the capture
    const handleCancel = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        "❌ smart-camera-web.cancelled event received:",
        customEvent.detail
      );
      toast.info("Verification cancelled");
      if (onBackRef.current) {
        onBackRef.current();
      }
    };

    // Handler for when user clicks back
    const handleBack = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        "⬅️ smart-camera-web.back event received:",
        customEvent.detail
      );
    };

    // Listen at DOCUMENT level - this catches events that bubble up from anywhere
    // SmileID's modal might be rendered outside our container, so document-level is more reliable
    document.addEventListener("smart-camera-web.publish", handlePublish);
    document.addEventListener("smart-camera-web.cancelled", handleCancel);
    document.addEventListener("smart-camera-web.back", handleBack);

    console.log("🎧 Document-level event listeners attached for SmileID");

    // Also try to attach directly to the element as backup
    let retryCount = 0;
    const maxRetries = 10;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let smartCameraElement: Element | null = null;

    const attachToElement = () => {
      const element = containerRef.current?.querySelector("smart-camera-web");

      if (!element) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `⏳ Waiting for smart-camera-web element... (attempt ${retryCount}/${maxRetries})`
          );
          retryTimeout = setTimeout(attachToElement, 300);
        }
        return;
      }

      smartCameraElement = element;

      // Add element-level listeners as backup
      element.addEventListener("smart-camera-web.publish", handlePublish);
      element.addEventListener("smart-camera-web.cancelled", handleCancel);
      element.addEventListener("smart-camera-web.back", handleBack);

      console.log("🎧 Element-level event listeners also attached");
    };

    // Small delay to ensure DOM is ready
    setTimeout(attachToElement, 100);

    // Cleanup
    return () => {
      clearTimeout(retryTimeout);

      // Remove document-level listeners
      document.removeEventListener("smart-camera-web.publish", handlePublish);
      document.removeEventListener("smart-camera-web.cancelled", handleCancel);
      document.removeEventListener("smart-camera-web.back", handleBack);

      // Remove element-level listeners if attached
      if (smartCameraElement) {
        smartCameraElement.removeEventListener(
          "smart-camera-web.publish",
          handlePublish
        );
        smartCameraElement.removeEventListener(
          "smart-camera-web.cancelled",
          handleCancel
        );
        smartCameraElement.removeEventListener(
          "smart-camera-web.back",
          handleBack
        );
      }

      console.log("🧹 All SmileID event listeners removed");
    };
  }, [step]); // Only depend on step - use refs for functions

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center w-full h-full p-5"
      >
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold">Verification Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <ActionButton onClick={onBack} variant="secondary">
            Go Back
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  // Show loading overlay when submitting images
  if (submitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center w-full h-full p-5"
      >
        <CgSpinner className="text-accent-primary w-10 h-10 animate-spin mb-4" />
        <p className="text-center font-medium">Verifying your identity...</p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Please wait while we process your documents
        </p>
      </motion.div>
    );
  }

  // Show result screen after verification
  if (step === "result" && verificationResult) {
    // ✅ PASSED
    if (verificationResult.passed) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center w-full h-full p-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6"
          >
            <span className="text-4xl">✅</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Verification Complete!
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {verificationResult.reason}
          </p>
          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 w-full max-w-sm">
            <p className="text-sm text-green-800 dark:text-green-200 text-center">
              Your identity has been verified. You now have full access to all
              features.
            </p>
          </div>
          {verificationResult.jobId && (
            <p className="text-xs text-muted-foreground mt-4">
              Reference: {verificationResult.jobId}
            </p>
          )}
        </motion.div>
      );
    }

    // ⏳ PENDING
    if (verificationResult.pending) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center w-full h-full p-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-6"
          >
            <span className="text-4xl">⏳</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-center mb-2">Under Review</h2>
          <p className="text-muted-foreground text-center mb-6">
            {verificationResult.reason}
          </p>
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 w-full max-w-sm mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              Our team is reviewing your documents. This usually takes 1-2
              business hours. We'll notify you once the review is complete.
            </p>
          </div>
          {verificationResult.jobId && (
            <p className="text-xs text-muted-foreground mb-4">
              Reference: {verificationResult.jobId}
            </p>
          )}
          <ActionButton onClick={onBack} variant="secondary">
            Continue to App
          </ActionButton>
        </motion.div>
      );
    }

    // ❌ FAILED
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center justify-center w-full h-full p-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-6"
        >
          <span className="text-4xl">❌</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Verification Failed
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          {verificationResult.reason}
        </p>
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 w-full max-w-sm mb-6">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            What you can do:
          </p>
          {verificationResult.isSystemError ? (
            // System error tips
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>• Wait a few minutes and try again</li>
              <li>• Check your internet connection</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          ) : (
            // User error tips
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>• Ensure your ID is valid and not expired</li>
              <li>• Take photos in good lighting without glare</li>
              <li>• Make sure your face is clearly visible in the selfie</li>
              <li>• Double-check your ID number is correct</li>
            </ul>
          )}
        </div>
        {verificationResult.jobId && (
          <p className="text-xs text-muted-foreground mb-4">
            Reference: {verificationResult.jobId}
          </p>
        )}
        <div className="flex gap-3 w-full max-w-sm">
          <ActionButton
            onClick={() => {
              setVerificationResult(null);
              setStep("id-details");
            }}
            className="flex-1"
          >
            Try Again
          </ActionButton>
          <ActionButton onClick={onBack} variant="secondary" className="flex-1">
            Cancel
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  // Step 1: ID Details Form
  if (step === "id-details") {
    return (
      <motion.div
        initial={{ x: 4, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col w-full h-full"
      >
        {/* Header */}
        <div className="p-5 pb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-text-default mb-4"
            >
              ← Back
            </button>
          )}
          <h1 className="text-2xl font-bold mb-2">Enter ID Details</h1>
          <p className="text-muted-foreground text-sm">
            Please provide your ID information for {country.flag} {country.name}
          </p>
        </div>

        {/* ID Details Form */}
        <div className="flex-1 px-5 space-y-4">
          {/* ID Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ID Type <span className="text-red-500">*</span>
            </label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary appearance-none"
            >
              <option value="">Select ID type...</option>
              {availableIdTypes.map((type) => (
                <option key={type} value={type}>
                  {ID_TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>

          {/* ID Number Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your ID number"
              className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be verified against government records
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
              🔒 Why do we need this?
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Your ID number allows us to verify your identity against official
              government records, providing enhanced security and faster
              verification.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="p-5">
          <ActionButton
            onClick={handleProceedToCapture}
            disabled={!idType || !idNumber.trim()}
          >
            Continue to Photo Capture
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  // Step 2: Camera Capture
  return (
    <motion.div
      initial={{ x: 4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col w-full h-full"
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <button
          onClick={() => setStep("id-details")}
          className="text-sm text-muted-foreground hover:text-text-default mb-4"
        >
          ← Back to ID Details
        </button>
        <h1 className="text-2xl font-bold mb-2">Identity Verification</h1>
        <p className="text-muted-foreground text-sm">
          Follow the instructions to capture your selfie and ID document
        </p>
      </div>

      {/* Selected ID Info */}
      <div className="px-5 pb-2">
        <div className="bg-surface-secondary rounded-lg p-3 flex items-center gap-3">
          <div className="text-2xl">{country.flag}</div>
          <div>
            <p className="text-sm font-medium">
              {ID_TYPE_LABELS[idType] || idType}
            </p>
            <p className="text-xs text-muted-foreground">ID: {idNumber}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-5 pb-4">
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            📸 What you'll need:
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Your face clearly visible</li>
            <li>• Your {ID_TYPE_LABELS[idType] || "ID"} document</li>
            <li>• Good lighting</li>
            <li>• A steady hand</li>
          </ul>
        </div>
      </div>

      {/* Smile ID Component Container */}
      <div className="flex-1 px-5">
        <div
          ref={containerRef}
          id="smile-id-container"
          className="w-full h-full"
        >
          <smart-camera-web capture-id theme-color="#000" />
        </div>
      </div>
    </motion.div>
  );
}
