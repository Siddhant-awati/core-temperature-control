import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ControlPanel } from "./ControlPanel";

describe("ControlPanel", () => {
  const setup = () => {
    const mockOnControlChange = vi.fn();
    const initialControls = {
      heater: 0.5,
      in_tap: 1.0,
      out_tap: 1.0,
    };

    render(
      <ControlPanel
        controls={initialControls}
        onControlChange={mockOnControlChange}
      />
    );

    return { mockOnControlChange };
  };

  it("renders all controls with initial values", () => {
    setup();
    expect(screen.getByText(/Heater Energy Output: 0.50/)).toBeInTheDocument();
    expect(screen.getByText(/In Tap Flow Rate: 1.00 L\/s/)).toBeInTheDocument();
    expect(
      screen.getByText(/Out Tap Flow Rate: 1.00 L\/s/)
    ).toBeInTheDocument();
  });

  it("calls onControlChange when heater slider is changed", () => {
    const { mockOnControlChange } = setup();
    const sliders = screen.getAllByRole("slider");
    const heaterSlider = sliders[0];

    fireEvent.change(heaterSlider, { target: { value: "0.8" } });

    expect(mockOnControlChange).toHaveBeenCalledWith("heater", 0.8);
  });

  it("calls onControlChange when in_tap slider is changed", () => {
    const { mockOnControlChange } = setup();
    const sliders = screen.getAllByRole("slider");
    const inTapSlider = sliders[1];

    fireEvent.change(inTapSlider, { target: { value: "1.5" } });

    expect(mockOnControlChange).toHaveBeenCalledWith("in_tap", 1.5);
  });

  it("calls onControlChange when out_tap slider is changed", () => {
    const { mockOnControlChange } = setup();
    const sliders = screen.getAllByRole("slider");
    const outTapSlider = sliders[2];

    fireEvent.change(outTapSlider, { target: { value: "0.6" } });

    expect(mockOnControlChange).toHaveBeenCalledWith("out_tap", 0.6);
  });
});
