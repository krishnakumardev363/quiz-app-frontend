import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, CheckCircle2, XCircle } from "lucide-react";
import api from "../api/axios";

export default function MyHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/quiz/results/my")
      .then((res) => setResults(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-1"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <h1 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <History size={20} className="text-[#0066FF]" />
            My Exam History
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {results.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">
            You haven't attempted any quizzes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {results.map((r) => {
              const percent = Math.round((r.correctCount / r.totalQuestions) * 100);
              const passed = percent >= 75;
              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        passed ? "bg-emerald-100" : "bg-red-50"
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 size={17} className="text-emerald-600" />
                      ) : (
                        <XCircle size={17} className="text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.quizId?.title || "Quiz"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.completedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {r.mode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-display font-bold text-lg ${
                        passed ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {percent}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.correctCount}/{r.totalQuestions} correct
                    </p>
                    {r.mode === "multiplayer" && r.rank && (
                      <p className="text-xs font-semibold text-violet-600 mt-0.5">
                        Ranked #{r.rank} of {r.totalPlayers}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
