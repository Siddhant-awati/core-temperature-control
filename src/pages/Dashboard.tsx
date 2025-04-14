import { Button, Container, CircularProgress } from "@mui/material";
import { useSession } from "../hooks/useSession";
import { StatusPanel } from "../components/StatusPanel";
import { ControlPanel } from "../components/ControlPanel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

export const Dashboard = () => {
  const {
    sessionId,
    status,
    error,
    isLoading,
    meltdown,
    startNewSession,
    updateControlValue,
  } = useSession();

  if (!sessionId || !status) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Button
          variant="contained"
          onClick={startNewSession}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Start New Session"}
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button variant="contained" onClick={startNewSession} sx={{ mb: 3 }}>
          Restart Session
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 6 }}>
              <StatusPanel
                status={status}
                error={error}
                meltdown={meltdown}
                onRestart={startNewSession}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              {" "}
              {!meltdown && (
                <ControlPanel
                  controls={{
                    heater: status.controls.heater.energy_output,
                    in_tap: status.controls.in_tap.flow,
                    out_tap: status.controls.out_tap.flow,
                  }}
                  onControlChange={updateControlValue}
                />
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};
