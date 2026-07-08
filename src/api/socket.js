import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000/api";

// Single shared socket instance for the whole app
const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});

export default socket;
