import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Copy, Check, Play } from "lucide-react";
import socket from "../api/socket";
import api from "../api/axios";

export default function MultiplayerLobby() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    api.get("/auth/me").then((res) => setUserName(res.data.name));

    socket.on("room-created", ({ roomCode: code }) => {
      setRoomCode(code);
      setIsHost(true);
      setError("");
    });

    socket.on("joined-room", () => setError(""));

    socket.on("player-list-updated", ({ players }) => setPlayers(players));

    socket.on("room-error", ({ message }) => setError(message));

    return () => {
      socket.off("room-created");
      socket.off("joined-room");
      socket.off("player-list-updated");
      socket.off("room-error");
    };
  }, []);

  // Host and players go to DIFFERENT screens once the quiz starts:
  // host gets a read-only "host view", players get the interactive quiz.
  useEffect(() => {
    const handleNewQuestion = () => {
      if (!roomCode) return;
      navigate(isHost ? `/multiplayer/${roomCode}/host` : `/multiplayer/${roomCode}/play`);
    };
    socket.on("new-question", handleNewQuestion);
    return () => socket.off("new-question", handleNewQuestion);
  }, [roomCode, isHost, navigate]);

  const handleCreateRoom = () => {
    socket.emit("create-room", { quizId });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    socket.emit("join-room", { roomCode: code });
    setRoomCode(code);
  };

  const handleStart = () => {
    socket.emit("start-quiz", { roomCode });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-4"
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-violet-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900">Live Multiplayer Quiz</h1>
          {userName && <p className="text-xs text-gray-400 mt-1">Playing as {userName}</p>}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        )}

        {!roomCode && quizId && (
          <button
            onClick={handleCreateRoom}
            className="w-full bg-[#0066FF] text-white font-semibold rounded-xl py-3 text-sm hover:bg-blue-700 transition-colors"
          >
            Create Room for This Quiz
          </button>
        )}

        {!roomCode && !quizId && (
          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter room code"
              maxLength={6}
              className="w-full text-center tracking-widest uppercase rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
            <button
              type="submit"
              className="w-full bg-[#0066FF] text-white font-semibold rounded-xl py-3 text-sm hover:bg-blue-700 transition-colors"
            >
              Join Room
            </button>
          </form>
        )}

        {roomCode && (
          <div>
            <div className="bg-blue-50 rounded-xl p-5 text-center mb-5">
              <p className="text-xs text-blue-400 font-medium mb-1">Room Code</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-display text-3xl font-bold text-[#0066FF] tracking-widest">
                  {roomCode}
                </p>
                <button onClick={handleCopyCode} className="text-blue-400 hover:text-blue-600">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {isHost && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4 text-center">
                As the host, you'll watch live progress but won't answer questions yourself.
              </p>
            )}

            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Players ({players.length})
            </p>
            <div className="space-y-1.5 mb-5">
              {players.length === 0 ? (
                <p className="text-sm text-gray-400">Waiting for players to join...</p>
              ) : (
                players.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {p.name}
                  </div>
                ))
              )}
            </div>

            {isHost && (
              <button
                onClick={handleStart}
                disabled={players.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold rounded-xl py-3 text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Play size={16} /> Start Quiz
              </button>
            )}
            {!isHost && (
              <p className="text-center text-sm text-gray-400">Waiting for host to start...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
