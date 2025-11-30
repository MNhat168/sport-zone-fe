import { useCallback, useEffect, useRef, useState } from "react";
import { getEkycStatus } from "@/features/field-owner-registration/registrationAPI";

export interface EkycData {
  fullName: string;
  idNumber: string;
  address: string;
}

export type EkycPollingStatus =
  | "idle"
  | "polling"
  | "verified"
  | "failed"
  | "timeout";

export interface UseEkycPollingReturn {
  status: EkycPollingStatus;
  data: EkycData | null;
  error: string | null;
  startPolling: (sessionId: string) => void;
  stopPolling: () => void;
}

const MAX_ATTEMPTS = 40; // ~2 minutes with 3s interval
const POLL_INTERVAL = 3000;

export const useEkycPolling = (): UseEkycPollingReturn => {
  const [status, setStatus] = useState<EkycPollingStatus>("idle");
  const [data, setData] = useState<EkycData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const clearPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const stopPolling = useCallback(() => {
    clearPolling();
    if (status === "polling") {
      setStatus("idle");
    }
  }, [clearPolling, status]);

  const poll = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      const result = await getEkycStatus(sessionIdRef.current);

      if (result.status === "verified") {
        setStatus("verified");
        if (result.data) {
          setData({
            fullName: result.data.fullName,
            idNumber: result.data.idNumber,
            address: result.data.address,
          });
        }
        clearPolling();
        return;
      }

      if (result.status === "failed") {
        setStatus("failed");
        setError("Xác thực danh tính thất bại");
        clearPolling();
        return;
      }

      // pending -> continue polling
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setStatus("timeout");
        setError("Hết thời gian chờ. Vui lòng thử lại.");
        clearPolling();
      }
    } catch (err: any) {
      console.error("Poll eKYC status error:", err);
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Lỗi khi kiểm tra trạng thái xác thực",
      );
    }
  }, [clearPolling]);

  const startPolling = useCallback(
    (sessionId: string) => {
      sessionIdRef.current = sessionId;
      setStatus("polling");
      setError(null);
      attemptsRef.current = 0;

      // trigger immediately
      void poll();

      // then schedule interval
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(poll, POLL_INTERVAL);
    },
    [poll],
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return {
    status,
    data,
    error,
    startPolling,
    stopPolling,
  };
};


