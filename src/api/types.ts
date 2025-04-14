export interface SessionResponse {
  id: string;
}

export interface SystemStatus {
  meta: {
    total_time: number;
    failed_state_time: number;
  };
  message: string;
  readings: {
    outer_tank: {
      temperature: number;
      volume: number;
    };
    inner_tank: {
      temperature: number;
      minimum: number;
      maximum: number;
    };
  };
  controls: {
    heater: {
      energy_output: number;
    };
    in_tap: {
      flow: number;
    };
    out_tap: {
      flow: number;
    };
  };
}

export interface ControlUpdateResponse {
  message: string;
}
