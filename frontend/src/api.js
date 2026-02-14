import axios from "axios";

const API = "http://localhost:5000/api/interview";

export const startInterview = (role) =>
  axios.post(`${API}/start`, { role });

export const nextQuestion = (data) =>
  axios.post(`${API}/next`, data);

export const getScorecard = (sessionId) =>
  axios.get(`${API}/scorecard/${sessionId}`);
