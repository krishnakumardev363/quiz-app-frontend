import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://quiz-app1-hrrz.onrender.com/api";

// Single shared socket instance for the whole app
const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});

export default socket;
