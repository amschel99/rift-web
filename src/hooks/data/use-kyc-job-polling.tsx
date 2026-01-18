import { useState, useEffect, useCallback, useRef } from "react";

interface KYCJobStatusResponse {
  success: boolean;
  jobId: string;
  status: "pending" | "provisional" | "verified" | "failed";
  complete: boolean;
  passed: boolean;
  underReview: boolean;
  message: string;
  reason?: string;
}

interface UseKYCJobPollingOptions {
  jobId: string | null;
  enabled: boolean;
  onComplete?: (result: KYCJobStatusResponse) => void;
  onError?: (error: Error) => void;
  pollingInterval?: number; // in milliseconds, default 15 seconds
  maxPollingTime?: number; // in milliseconds, default 10 minutes
}

interface UseKYCJobPollingResult {
  status: KYCJobStatusResponse | null;
  isPolling: boolean;
  error: Error | null;
  elapsedTime: number; // in seconds
  stopPolling: () => void;
  startPolling: () => void;
}

async function fetchJobStatus(jobId: string): Promise<KYCJobStatusResponse> {
  const authToken = localStorage.getItem("token");
  const apiKey = import.meta.env.VITE_SDK_API_KEY;
  const apiUrl =
    import.meta.env.VITE_API_URL || "https://70f763cc5e5e.ngrok-free.app";

  if (!authToken) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${apiUrl}/api/kyc/job/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch job status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Hook for polling KYC job status when verification is under review.
 * Use this when the initial verification request returns `pending: true`.
 *
 * Polling Strategy:
 * - Polls every 15 seconds by default
 * - Stops when `complete: true` is returned
 * - Max polling time: 10 minutes (then asks user to check later)
 */
export default function useKYCJobPolling({
  jobId,
  enabled,
  onComplete,
  onError,
  pollingInterval = 15000, // 15 seconds
  maxPollingTime = 10 * 60 * 1000, // 10 minutes
}: UseKYCJobPollingOptions): UseKYCJobPollingResult {
  const [status, setStatus] = useState<KYCJobStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const startTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    setIsPolling(false);
    startTimeRef.current = null;
  }, []);

  const poll = useCallback(async () => {
    if (!jobId) return;

    // Check if max polling time exceeded
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= maxPollingTime) {
        
        stopPolling();
        const timeoutError = new Error(
          "Verification is taking longer than expected. Please check back later or contact support."
        );
        setError(timeoutError);
        onErrorRef.current?.(timeoutError);
        return;
      }
    }

    try {
      
      const result = await fetchJobStatus(jobId);
      setStatus(result);
      setError(null);

      

      // Check if verification is complete
      if (result.complete) {
        
        stopPolling();
        onCompleteRef.current?.(result);
      }
    } catch (err) {
      
      const pollError =
        err instanceof Error ? err : new Error("Failed to check status");
      setError(pollError);
      // Don't stop polling on transient errors, just log them
      // Only stop on persistent errors after a few retries
    }
  }, [jobId, maxPollingTime, stopPolling]);

  const startPolling = useCallback(() => {
    if (!jobId || isPolling) return;

    
    setIsPolling(true);
    setError(null);
    setElapsedTime(0);
    startTimeRef.current = Date.now();

    // Do an immediate poll
    poll();

    // Set up polling interval
    intervalRef.current = setInterval(poll, pollingInterval);

    // Set up elapsed time counter (updates every second)
    elapsedIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  }, [jobId, isPolling, poll, pollingInterval]);

  // Auto-start polling when enabled and jobId is available
  useEffect(() => {
    if (enabled && jobId && !isPolling) {
      startPolling();
    }

    // Cleanup on unmount or when disabled
    return () => {
      if (!enabled) {
        stopPolling();
      }
    };
  }, [enabled, jobId, startPolling, stopPolling, isPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    isPolling,
    error,
    elapsedTime,
    stopPolling,
    startPolling,
  };
}

