import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Single shared socket instance for the whole app.
// transports is explicitly set to polling-first because some free-tier hosts
// (like Render's free web service tier) have flaky WebSocket upgrade support
// through their proxy layer. Socket.io will still try to upgrade to
// websocket after a stable polling connection is established.
const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["polling", "websocket"],
});

export default socket;
