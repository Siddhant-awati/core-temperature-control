import React, { useState } from "react";
import { Slider, Typography, Box, Paper } from "@mui/material";

interface ControlPanelProps {
  controls: {
    heater: number;
    in_tap: number;
    out_tap: number;
  };
  onControlChange: (
    controlName: "heater" | "in_tap" | "out_tap",
    value: number
  ) => void;
}

export const ControlPanel = ({
  controls,
  onControlChange,
}: ControlPanelProps) => {
  const [activeControl, setActiveControl] = useState<string | null>(null);

  const handleChange = (
    controlName: "heater" | "in_tap" | "out_tap",
    value: number
  ) => {
    setActiveControl(controlName);
    onControlChange(controlName, value);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Controls {activeControl && `(Adjusting ${activeControl})`}
      </Typography>
      <Box>
        <Box sx={{ width: "100%", mb: 2 }}>
          <Typography gutterBottom>
            Heater Energy Output: {controls.heater.toFixed(2)}
          </Typography>
          <Slider
            value={controls.heater}
            onChange={(_, newValue) =>
              handleChange("heater", newValue as number)
            }
            onChangeCommitted={() => setActiveControl(null)}
            min={0}
            max={1}
            step={0.01}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => v.toFixed(2)}
          />
        </Box>
        <Box sx={{ width: "100%", mb: 2 }}>
          <Typography gutterBottom>
            In Tap Flow Rate: {controls.in_tap.toFixed(2)} L/s
          </Typography>
          <Slider
            value={controls.in_tap}
            onChange={(_, newValue) =>
              handleChange("in_tap", newValue as number)
            }
            onChangeCommitted={() => setActiveControl(null)}
            min={0}
            max={2}
            step={0.05}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v.toFixed(2)} L/s`}
          />
        </Box>
        <Box sx={{ width: "100%", mb: 2 }}>
          <Typography gutterBottom>
            Out Tap Flow Rate: {controls.out_tap.toFixed(2)} L/s
          </Typography>
          <Slider
            value={controls.out_tap}
            onChange={(_, newValue) =>
              handleChange("out_tap", newValue as number)
            }
            onChangeCommitted={() => setActiveControl(null)}
            min={0}
            max={2}
            step={0.05}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v.toFixed(2)} L/s`}
          />
        </Box>
      </Box>
    </Paper>
  );
};
