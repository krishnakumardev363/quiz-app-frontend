import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookText } from "lucide-react";
import api from "../api/axios";

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/courses/lessons/${lessonId}`)
      .then((res) => setLesson(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load lesson."))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-2"
          >
            <ArrowLeft size={13} /> Back to course
          </button>
          <h1 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookText size={20} className="text-violet-600" />
            {lesson.title}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {lesson.content}
          </p>
        </div>
      </div>
    </div>
  );
}
