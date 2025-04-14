import axios from "axios";
import { SystemStatus, SessionResponse, ControlUpdateResponse } from "./types";

const API_BASE_URL = "http://35.206.167.118:8888";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
});

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 166;

export async function rateLimitedRequest<T>(config: any): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      throw new Error(
        error.response.data?.message || "CORE MELTDOWN IMMINENT, EVACUATE"
      );
    }
    throw error;
  }
}

export const createSession = async (): Promise<SessionResponse> => {
  return rateLimitedRequest({
    method: "post",
    url: "/sessions",
  });
};

export const getSystemStatus = async (
  sessionId: string
): Promise<SystemStatus> => {
  return rateLimitedRequest({
    method: "get",
    url: `/sessions/${sessionId}`,
  });
};

export const updateControl = async (
  sessionId: string,
  controlName: "heater" | "in_tap" | "out_tap",
  value: number
): Promise<ControlUpdateResponse> => {
  return rateLimitedRequest({
    method: "post",
    url: `/sessions/${sessionId}/inputs/${controlName}`,
    data: value.toString(),
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
