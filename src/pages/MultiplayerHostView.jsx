import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trophy, Medal, AlertTriangle } from "lucide-react";
import socket from "../api/socket";

export default function MultiplayerHostView() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [finished, setFinished] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);

  useEffect(() => {
    socket.on("new-question", (data) => setQuestion(data));
    socket.on("leaderboard-update", ({ leaderboard }) => setLeaderboard(leaderboard));
    socket.on("quiz-finished", ({ leaderboard }) => {
      setFinished(true);
      setFinalLeaderboard(leaderboard);
    });

    return () => {
      socket.off("new-question");
      socket.off("leaderboard-update");
      socket.off("quiz-finished");
    };
  }, []);

  if (finished) {
    const medalColors = ["text-amber-500", "text-gray-400", "text-amber-700"];
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Trophy size={32} className="text-amber-500 mx-auto mb-3" />
          <h1 className="font-display text-xl font-bold text-gray-900 mb-5">Quiz Finished!</h1>
          <div className="space-y-2 mb-6">
            {finalLeaderboard.map((p) => (
              <div
                key={p.rank}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  {p.rank <= 3 ? (
                    <Medal size={16} className={medalColors[p.rank - 1]} />
                  ) : (
                    <span className="text-sm font-semibold text-gray-400 w-4">{p.rank}</span>
                  )}
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                </div>
                <span className="font-display font-bold text-[#0066FF] text-sm">{p.score} pts</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="w-full bg-[#0066FF] text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-blue-700 transition-colors"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Starting quiz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg px-3 py-2 mb-4">
          <AlertTriangle size={14} className="shrink-0" />
          Don't close this tab until the quiz is complete — closing it will end the room for everyone.
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-500">
            Host View — Question {question.index + 1} of {question.total}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <p className="font-display font-semibold text-gray-900 text-lg mb-5">
            {question.questionText}
          </p>
          <div className="space-y-2.5">
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Live Leaderboard</p>
          <div className="space-y-1.5">
            {leaderboard.map((p) => (
              <div key={p.rank} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  #{p.rank} {p.name}
                  {p.hasAnsweredCurrent ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      Answered
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      Still writing
                    </span>
                  )}
                </span>
                <span className="font-semibold text-[#0066FF]">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
