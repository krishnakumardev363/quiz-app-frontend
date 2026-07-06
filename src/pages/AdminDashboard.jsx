import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Copy, BookOpen, BarChart3 } from "lucide-react";
import api from "../api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete course.");
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
      <div className="bg-gray-900 px-6 py-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-blue-300 text-xs font-medium">Admin Panel</p>
            <h1 className="font-display text-2xl font-bold text-white mt-0.5">Manage Courses</h1>
          </div>
          <Link
            to="/admin/courses/new"
            className="flex items-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> New Course
          </Link>
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
                  <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{course.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${course._id}/manage`)}
                    className="text-xs font-medium text-[#0066FF] hover:underline px-2"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
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
    </div>
  );
}
