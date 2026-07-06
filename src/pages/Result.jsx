import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Trophy, RotateCcw, Eye } from "lucide-react";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams();

  const data = location.state?.result;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No result to show.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#0066FF] text-sm font-medium hover:underline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { result, xpEarned, passed } = data;
  const percentScore = Math.round((result.correctCount / result.totalQuestions) * 100);

  const chartData = [
    { name: "Correct", value: result.correctCount, color: "#16A34A" },
    { name: "Wrong", value: result.wrongCount, color: "#EF4444" },
    { name: "Skipped", value: result.skippedCount, color: "#D1D5DB" },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            passed ? "bg-amber-50" : "bg-red-50"
          }`}
        >
          <Trophy size={26} className={passed ? "text-amber-500" : "text-red-400"} />
        </div>

        <h1 className="font-display text-2xl font-bold text-gray-900">
          {passed ? "Quiz Complete!" : "Not quite there yet"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {passed ? (
            xpEarned > 0 ? (
              <>You earned <span className="font-semibold text-[#0066FF]">{xpEarned} XP</span></>
            ) : (
              <span className="text-gray-400">Retake — no additional XP awarded</span>
            )
          ) : (
            <span className="text-red-500 font-medium">
              You need at least 75% to complete this quiz. Give it another try!
            </span>
          )}
        </p>

        <div className="relative w-40 h-40 mx-auto my-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={55}
                outerRadius={70}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-gray-900">{percentScore}%</span>
            <span className="text-xs text-gray-400">Score</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox label="Correct" value={result.correctCount} color="text-emerald-600" />
          <StatBox label="Wrong" value={result.wrongCount} color="text-red-500" />
          <StatBox label="Skipped" value={result.skippedCount} color="text-gray-400" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/quiz/${quizId}`)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={15} /> Retake
          </button>
          <button
            onClick={() => navigate(`/quiz/${quizId}/review`, { state: { result } })}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-blue-700 transition-colors"
          >
            <Eye size={15} /> Review Answers
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-gray-50 rounded-xl py-3">
      <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
