import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSession } from "./useSession";
import {
  createSession,
  getSystemStatus,
  updateControl,
} from "../api/apiClient";

vi.mock("../api/apiClient");

const mockSession = { id: "123" };
const mockStatus = {
  meta: { total_time: 100, failed_state_time: 0 },
  message: "OK",
  readings: {
    outer_tank: { temperature: 50, volume: 20 },
    inner_tank: { temperature: 55, minimum: 50, maximum: 60 },
  },
  controls: {
    heater: { energy_output: 0.5 },
    in_tap: { flow: 1 },
    out_tap: { flow: 1 },
  },
};

describe("useSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (createSession as any).mockResolvedValue(mockSession);
    (getSystemStatus as any).mockResolvedValue(mockStatus);
    (updateControl as any).mockResolvedValue({ message: "Success" });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("initializes with no session", () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.sessionId).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test("starts new session", async () => {
    const { result } = renderHook(() => useSession());

    await act(async () => {
      await result.current.startNewSession();
    });

    expect(result.current.sessionId).toBe("123");
    expect(result.current.status).toEqual(mockStatus);
    expect(result.current.isLoading).toBe(false);
  });

  test("polls for status updates", async () => {
    const { result } = renderHook(() => useSession());

    await act(async () => {
      await result.current.startNewSession();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(getSystemStatus).toHaveBeenCalledTimes(2);
  });

  test("updates control values", async () => {
    const { result } = renderHook(() => useSession());

    await act(async () => {
      await result.current.startNewSession();
    });

    act(() => {
      result.current.updateControlValue("heater", 0.8);
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(updateControl).toHaveBeenCalledWith("123", "heater", 0.8);
  });

  test("handles meltdown condition", async () => {
    const meltdownStatus = {
      ...mockStatus,
      meta: { total_time: 200, failed_state_time: 120 },
      message: "CORE MELTDOWN IMMINENT, EVACUATE",
    };
    (getSystemStatus as any).mockResolvedValueOnce(meltdownStatus);

    const { result } = renderHook(() => useSession());

    await act(async () => {
      await result.current.startNewSession();
    });

    expect(result.current.meltdown).toBe(true);
    expect(result.current.error).toBe("CORE MELTDOWN IMMINENT, EVACUATE");
  });
});
