import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusPanel } from "./StatusPanel";
import { SystemStatus } from "../api/types";

const baseStatus: SystemStatus = {
  message: "System nominal",
  readings: {
    inner_tank: {
      temperature: 60,
      minimum: 50,
      maximum: 70,
    },
    outer_tank: {
      temperature: 30,
      volume: 120,
    },
  },
  meta: {
    failed_state_time: 30,
    total_time: 100,
  },
  controls: {
    heater: {
      energy_output: 0,
    },
    in_tap: {
      flow: 0,
    },
    out_tap: {
      flow: 0,
    },
  },
};

describe("StatusPanel", () => {
  it("shows meltdown warning and restart button", () => {
    const mockRestart = vi.fn();

    render(
      <StatusPanel
        status={baseStatus}
        error={null}
        meltdown={true}
        onRestart={mockRestart}
      />
    );

    expect(
      screen.getByText(/CORE MELTDOWN IMMINENT, EVACUATE/i)
    ).toBeInTheDocument();

    const restartButton = screen.getByRole("button", {
      name: /Start New Session/i,
    });

    fireEvent.click(restartButton);
    expect(mockRestart).toHaveBeenCalled();
  });

  it("displays error alert when error is passed", () => {
    render(
      <StatusPanel
        status={baseStatus}
        error="Something went wrong"
        meltdown={false}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("displays info alert when failed_state_time <= 60", () => {
    render(
      <StatusPanel
        status={{
          ...baseStatus,
          meta: { ...baseStatus.meta, failed_state_time: 30 },
        }}
        error={null}
        meltdown={false}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText("System nominal")).toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("MuiAlert-standardInfo");
  });

  it("displays warning alert when failed_state_time > 60", () => {
    render(
      <StatusPanel
        status={{
          ...baseStatus,
          meta: { ...baseStatus.meta, failed_state_time: 75 },
        }}
        error={null}
        meltdown={false}
        onRestart={() => {}}
      />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("MuiAlert-standardWarning");
  });

  it("displays error alert when failed_state_time > 90", () => {
    render(
      <StatusPanel
        status={{
          ...baseStatus,
          meta: { ...baseStatus.meta, failed_state_time: 95 },
        }}
        error={null}
        meltdown={false}
        onRestart={() => {}}
      />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("MuiAlert-standardError");
  });

  it("displays 'DANGER' when inner tank temperature is out of range", () => {
    const dangerStatus = {
      ...baseStatus,
      readings: {
        ...baseStatus.readings,
        inner_tank: {
          ...baseStatus.readings.inner_tank,
          temperature: 100,
        },
      },
    };

    render(
      <StatusPanel
        status={dangerStatus}
        error={null}
        meltdown={false}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText(/DANGER/i)).toBeInTheDocument();
  });

  it("renders meltdown risk and progress bar", () => {
    render(
      <StatusPanel
        status={{
          ...baseStatus,
          meta: { ...baseStatus.meta, failed_state_time: 60 },
        }}
        error={null}
        meltdown={false}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText(/Meltdown Risk: 50.0%/i)).toBeInTheDocument();
  });

  it("renders all temperature, volume and time data", () => {
    render(
      <StatusPanel
        status={baseStatus}
        error={null}
        meltdown={false}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText(/Inner Tank Temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/Outer Tank Temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/Outer Tank Volume/i)).toBeInTheDocument();
    expect(screen.getByText(/Time in Failed State/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Session Time/i)).toBeInTheDocument();
  });
});
