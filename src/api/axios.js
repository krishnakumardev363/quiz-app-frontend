import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://quiz-app1-hrrz.onrender.com/api",
  withCredentials: true, // send/receive HTTP-only cookie
});

export default api;
