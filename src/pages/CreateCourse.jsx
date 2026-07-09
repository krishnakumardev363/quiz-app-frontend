import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    certificateXpRequired: 0,
    visibility: "public",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/courses", form);
      navigate(`/admin/courses/${res.data._id}/manage`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-3"
        >
          <ArrowLeft size={13} /> Admin Dashboard
        </Link>
        <h1 className="font-display text-xl font-bold text-gray-900 mb-5">Create Course</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Web Development"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Programming"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What will students learn?"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate XP requirement <span className="text-gray-400 font-normal">(0 = free for everyone)</span>
            </label>
            <input
              type="number"
              min="0"
              name="certificateXpRequired"
              value={form.certificateXpRequired}
              onChange={handleChange}
              placeholder="e.g. 250 for a premium course"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
            <p className="text-xs text-gray-400 mt-1">
              Students need this much XP to download the certificate for this course.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: "public" })}
                className={`text-sm font-medium rounded-lg py-2.5 border transition-colors ${
                  form.visibility === "public"
                    ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: "private" })}
                className={`text-sm font-medium rounded-lg py-2.5 border transition-colors ${
                  form.visibility === "private"
                    ? "border-violet-500 bg-violet-50 text-violet-600"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Private
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {form.visibility === "private"
                ? "Hidden from the student catalog. Students can only join via a multiplayer room code you share."
                : "Visible to all students in the course catalog."}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
