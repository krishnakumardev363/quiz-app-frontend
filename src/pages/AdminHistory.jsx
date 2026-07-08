import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, Trash2, CheckCircle2, XCircle, LayoutDashboard } from "lucide-react";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/questions/results/${deleteTarget}`);
      setDeleteTarget(null);
      fetchResults();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete result.");
      setDeleteTarget(null);
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
      <div className="bg-gray-900 px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-2">
            <Link to="/admin" className="inline-flex items-center gap-1 hover:text-gray-200">
              <ArrowLeft size={13} /> Admin Dashboard
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-gray-200">
              <LayoutDashboard size={13} /> Student Dashboard
            </Link>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <History size={20} className="text-amber-400" />
            All Exam Results
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

        {results.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">No exam attempts recorded yet.</p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="space-y-3 sm:hidden">
              {results.map((r) => {
                const percent = Math.round((r.correctCount / r.totalQuestions) * 100);
                const passed = percent >= 75;
                return (
                  <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {r.userId?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{r.userId?.email || ""}</p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget(r._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{r.quizId?.title || "Deleted quiz"}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          passed ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {percent}%
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        {new Date(r.completedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {r.mode}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
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
                              onClick={() => setDeleteTarget(r._id)}
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
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this result?"
        message="This will permanently remove this exam attempt from the student's history. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="warning"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
