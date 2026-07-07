import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, Trash2, CheckCircle2, XCircle } from "lucide-react";
import api from "../api/axios";

export default function AdminHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchResults = async () => {
    try {
      const res = await api.get("/admin/questions/results/all");
      setResults(res.data);
    } catch (err) {
      setMessage("Could not load results history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result permanently? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/questions/results/${id}`);
      fetchResults();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete result.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading results history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-gray-900 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-200 mb-2"
          >
            <ArrowLeft size={13} /> Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <History size={22} className="text-amber-400" />
            All Exam Results
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

        {results.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">No exam attempts recorded yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Quiz</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Mode</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const percent = Math.round((r.correctCount / r.totalQuestions) * 100);
                  const passed = percent >= 75;
                  return (
                    <tr key={r._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{r.userId?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-400">{r.userId?.email || ""}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{r.quizId?.title || "Deleted quiz"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            passed ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {percent}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(r.completedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                          {r.mode}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
