import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getCurrentUser: () => apiClient.get("/auth/me")
};

// ============ INTERVIEW PREP ENDPOINTS ============
export const interviewPrepAPI = {
  savePrep: (data) => apiClient.post("/interview-prep/prepare", data),
  verifySystem: (data) => apiClient.post("/interview-prep/verify-system", data),
  getRoles: () => apiClient.get("/interview-prep/roles"),
  getExperienceLevels: () => apiClient.get("/interview-prep/experience-levels"),
  getDifficultyLevels: () => apiClient.get("/interview-prep/difficulty-levels")
};

// ============ INTERVIEW ENDPOINTS ============
export const interviewAPI = {
  startInterview: (data) => apiClient.post("/interview/start", data),
  submitAnswer: (data) => apiClient.post("/interview/next", data),
  endInterview: (sessionId) => apiClient.post("/interview/end", { sessionId })
};

// ============ SCORECARD ENDPOINTS ============
export const scorecardAPI = {
  getScorecard: (sessionId) => apiClient.get(`/scorecard/${sessionId}`),
  generateReport: (sessionId) => apiClient.post("/scorecard/generate-report", { sessionId }),
  downloadPDF: (report) => apiClient.post("/scorecard/download", report, {
    responseType: "blob"
  })
};

// ============ UTILITY FUNCTIONS ============
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.Authorization;
  }
};

export const getAuthToken = () => localStorage.getItem("token");

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete apiClient.defaults.headers.Authorization;
};

export default apiClient;
