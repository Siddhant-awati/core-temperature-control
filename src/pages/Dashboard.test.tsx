import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { useSession } from "../hooks/useSession";

vi.mock("../hooks/useSession");

describe("Dashboard", () => {
  const mockStatus = {
    meta: { total_time: 100, failed_state_time: 0 },
    message: "OK",
    readings: {
      outer_tank: { temperature: 52, volume: 25 },
      inner_tank: { temperature: 58, minimum: 50, maximum: 60 },
    },
    controls: {
      heater: { energy_output: 0.5 },
      in_tap: { flow: 1 },
      out_tap: { flow: 1 },
    },
  };

  test("renders dashboard with session", () => {
    (useSession as any).mockReturnValue({
      sessionId: "123",
      status: mockStatus,
      error: null,
      isLoading: false,
      meltdown: false,
      startNewSession: vi.fn(),
      updateControlValue: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText("System Status")).toBeInTheDocument();
    expect(screen.getByText("Controls")).toBeInTheDocument();
  });

  test("shows loading state when starting session", () => {
    (useSession as any).mockReturnValue({
      sessionId: null,
      status: null,
      error: null,
      isLoading: true,
      meltdown: false,
      startNewSession: vi.fn(),
      updateControlValue: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
