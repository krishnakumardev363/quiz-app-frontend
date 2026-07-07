import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Trophy, Medal, AlertTriangle } from "lucide-react";
import socket from "../api/socket";
import api from "../api/axios";

export default function MultiplayerPlay() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [myName, setMyName] = useState("");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [finished, setFinished] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);

  useEffect(() => {
    api.get("/auth/me").then((res) => setMyName(res.data.name));

    socket.on("new-question", (data) => {
      setQuestion(data);
      setSelected(null);
      setSecondsLeft(data.timeLimit);
    });

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

  useEffect(() => {
    if (!question || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [question, secondsLeft]);

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option);
    socket.emit("submit-answer", {
      roomCode,
      questionIndex: question.index,
      selectedAnswer: option,
    });
  };

  if (finished) {
    const medalColors = ["text-amber-500", "text-gray-400", "text-amber-700"];
    const myEntry = finalLeaderboard.find((p) => p.name === myName);

    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Trophy size={32} className="text-amber-500 mx-auto mb-3" />
          <h1 className="font-display text-xl font-bold text-gray-900 mb-1">Quiz Finished!</h1>

          {myEntry && (
            <div className="bg-blue-50 rounded-xl px-5 py-4 my-4">
              <p className="text-xs text-blue-400 font-medium mb-1">Your Result</p>
              <p className="font-display text-3xl font-bold text-[#0066FF]">
                Rank #{myEntry.rank}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {myEntry.score} points · out of {finalLeaderboard.length} players
              </p>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-400 uppercase mb-2 text-left">
            Full Leaderboard
          </p>
          <div className="space-y-2 mb-6">
            {finalLeaderboard.map((p) => (
              <div
                key={p.rank}
                className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                  p.name === myName ? "bg-blue-50 ring-1 ring-[#0066FF]" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {p.rank <= 3 ? (
                    <Medal size={16} className={medalColors[p.rank - 1]} />
                  ) : (
                    <span className="text-sm font-semibold text-gray-400 w-4">{p.rank}</span>
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {p.name} {p.name === myName && "(You)"}
                  </span>
                </div>
                <span className="font-display font-bold text-[#0066FF] text-sm">{p.score} pts</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-[#0066FF] text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Waiting for the quiz to start...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg px-3 py-2 mb-4">
          <AlertTriangle size={14} className="shrink-0" />
          Don't exit this page until the quiz is complete, or you'll miss remaining questions.
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-500">
            Question {question.index + 1} of {question.total}
          </p>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
              secondsLeft <= 5 ? "bg-red-50 text-red-600" : "bg-blue-50 text-[#0066FF]"
            }`}
          >
            <Clock size={14} /> {secondsLeft}s
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <p className="font-display font-semibold text-gray-900 text-lg mb-5">
            {question.questionText}
          </p>
          <div className="space-y-2.5">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!selected}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selected === option
                    ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                } disabled:cursor-not-allowed`}
              >
                {option}
              </button>
            ))}
          </div>
          {selected && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Answer locked in. Waiting for next question...
            </p>
          )}
        </div>

        {/* Live mini leaderboard with answered/still-writing status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Live Leaderboard</p>
          <div className="space-y-1.5">
            {leaderboard.map((p) => (
              <div key={p.rank} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  #{p.rank} {p.name} {p.name === myName && "(You)"}
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
