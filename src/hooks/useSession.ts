import { useState, useEffect, useCallback } from "react";
import {
  createSession,
  getSystemStatus,
  updateControl,
} from "../api/apiClient";
import { SystemStatus } from "../api/types";

const BASE_POLL_INTERVAL = 1000;
const ACTIVE_CONTROL_POLL_INTERVAL = 200;

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveControl, setIsActiveControl] = useState(false);
  const [controlUpdateQueue, setControlUpdateQueue] = useState<
    {
      controlName: "heater" | "in_tap" | "out_tap";
      value: number;
    }[]
  >([]);
  const [meltdown, setMeltdown] = useState(false);

  const processControlQueue = useCallback(async () => {
    if (!sessionId || controlUpdateQueue.length === 0 || meltdown) return;

    const lastUpdate = controlUpdateQueue[controlUpdateQueue.length - 1];
    setControlUpdateQueue([]);

    try {
      await updateControl(sessionId, lastUpdate.controlName, lastUpdate.value);
      await fetchStatus(sessionId);
    } catch (err) {
      setError(`Failed to update ${lastUpdate.controlName}`);
      console.error(err);
    }
  }, [sessionId, controlUpdateQueue, meltdown]);

  const startNewSession = async () => {
    try {
      setIsLoading(true);
      setMeltdown(false);
      const session = await createSession();
      setSessionId(session.id);
      setError(null);
      await fetchStatus(session.id);
    } catch (err) {
      setError("Failed to create new session");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async (id: string) => {
    try {
      const systemStatus = await getSystemStatus(id);
      setStatus(systemStatus);
      setError(null);

      if (systemStatus.meta.failed_state_time >= 120) {
        setMeltdown(true);
        setError("CORE MELTDOWN IMMINENT, EVACUATE");
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === "CORE MELTDOWN IMMINENT, EVACUATE"
      ) {
        setMeltdown(true);
        setError(err.message);
      } else {
        setError("Failed to fetch system status");
        console.error(err);
      }
    }
  };

  const updateControlValue = async (
    controlName: "heater" | "in_tap" | "out_tap",
    value: number
  ) => {
    if (!sessionId || meltdown) return;

    setControlUpdateQueue((prev) => [...prev, { controlName, value }]);
    setIsActiveControl(true);
    setTimeout(() => setIsActiveControl(false), 1000);
  };

  useEffect(() => {
    if (!sessionId || meltdown) return;

    const pollInterval = isActiveControl
      ? ACTIVE_CONTROL_POLL_INTERVAL
      : BASE_POLL_INTERVAL;

    const intervalId = setInterval(() => {
      fetchStatus(sessionId);
      processControlQueue();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [sessionId, isActiveControl, processControlQueue, meltdown]);

  return {
    sessionId,
    status,
    error,
    isLoading,
    meltdown,
    startNewSession,
    updateControlValue,
  };
};
