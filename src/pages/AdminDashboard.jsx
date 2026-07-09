import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, BookOpen, BarChart3, LayoutDashboard, UserCog, Lock, Globe } from "lucide-react";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCourses = async () => {
    try {
      const [coursesRes, meRes] = await Promise.all([api.get("/admin/courses"), api.get("/auth/me")]);
      setCourses(coursesRes.data);
      setMe(meRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/courses/${deleteTarget}`);
      setDeleteTarget(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete course.");
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-gray-900 px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-200 mb-2"
          >
            <LayoutDashboard size={13} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <p className="text-blue-300 text-xs font-medium">Admin Panel</p>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                Manage Courses
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {me?.role === "admin" && (
                <>
                  <Link
                    to="/admin/staff"
                    className="flex items-center gap-1.5 bg-violet-500/20 text-violet-200 text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-violet-500/30 transition-colors"
                  >
                    <UserCog size={15} /> Manage Staff
                  </Link>
                  <Link
                    to="/admin/history"
                    className="flex items-center gap-1.5 bg-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-white/20 transition-colors"
                  >
                    <BarChart3 size={15} /> Results History
                  </Link>
                </>
              )}
              <Link
                to="/admin/courses/new"
                className="flex items-center gap-1.5 bg-[#0066FF] text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} /> New Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No courses created yet.</p>
            <Link
              to="/admin/courses/new"
              className="inline-flex items-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} /> Create your first course
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                    {course.visibility === "private" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">
                        <Lock size={9} /> Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        <Globe size={9} /> Public
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {course.category}
                    {course.instructorId?.name && (
                      <> • by {course.instructorId.name}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${course._id}/manage`)}
                    className="text-xs font-medium text-[#0066FF] hover:underline px-2"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => setDeleteTarget(course._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete course"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this course?"
        message="This will permanently remove the course along with its subjects, lessons, and quizzes. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="warning"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
