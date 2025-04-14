import {
  Alert,
  Paper,
  Typography,
  LinearProgress,
  Box,
  Button,
} from "@mui/material";
import { SystemStatus } from "../api/types";

interface StatusPanelProps {
  status: SystemStatus;
  error: string | null;
  meltdown: boolean;
  onRestart: () => void;
}

export const StatusPanel = ({
  status,
  error,
  meltdown,
  onRestart,
}: StatusPanelProps) => {
  const isInDanger = status.meta.failed_state_time > 60;
  const isCritical = status.meta.failed_state_time > 90;
  const meltdownRisk = Math.min(
    100,
    (status.meta.failed_state_time / 120) * 100
  );

  const isTempInRange =
    status.readings.inner_tank.temperature >=
      status.readings.inner_tank.minimum &&
    status.readings.inner_tank.temperature <=
      status.readings.inner_tank.maximum;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        System Status
      </Typography>

      {meltdown ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          CORE MELTDOWN IMMINENT, EVACUATE
          <Button
            variant="contained"
            color="error"
            onClick={onRestart}
            sx={{ ml: 2 }}
          >
            Start New Session
          </Button>
        </Alert>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : null}

      {status.message && !meltdown && (
        <Alert
          severity={isCritical ? "error" : isInDanger ? "warning" : "info"}
          sx={{ mb: 2 }}
        >
          {status.message}
        </Alert>
      )}

      {!meltdown && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Meltdown Risk: {meltdownRisk.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={meltdownRisk}
              color={isCritical ? "error" : isInDanger ? "warning" : "success"}
            />
          </Box>

          <Typography variant="body1" gutterBottom>
            Inner Tank Temperature:{" "}
            {status.readings.inner_tank.temperature.toFixed(2)}°C
            <br />
            (Safe range: {status.readings.inner_tank.minimum}°C -{" "}
            {status.readings.inner_tank.maximum}°C)
            <br />
            Status:{" "}
            {isTempInRange ? (
              <span style={{ color: "green" }}>SAFE</span>
            ) : (
              <span style={{ color: "red" }}>DANGER</span>
            )}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Outer Tank Temperature:{" "}
            {status.readings.outer_tank.temperature.toFixed(2)}°C
          </Typography>

          <Typography variant="body1" gutterBottom>
            Outer Tank Volume: {status.readings.outer_tank.volume.toFixed(2)}L
          </Typography>

          <Typography variant="body1" gutterBottom>
            Time in Failed State: {status.meta.failed_state_time.toFixed(2)}s
            <br />
            Total Session Time: {status.meta.total_time.toFixed(2)}s
          </Typography>
        </>
      )}
    </Paper>
  );
};
