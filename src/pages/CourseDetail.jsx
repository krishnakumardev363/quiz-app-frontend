import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Clock, PlayCircle, CheckCircle2, Info, Users } from "lucide-react";
import api from "../api/axios";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [detailRes, meRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get("/auth/me"),
        ]);
        setCourse(detailRes.data.course);
        setSubjects(detailRes.data.subjects);
        setIsAdmin(meRes.data.role === "admin");
      } catch (err) {
        setError(err.response?.data?.message || "Could not load course.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading course...</p>
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
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-2"
          >
            <ArrowLeft size={13} /> Courses
          </Link>
          <h1 className="font-display text-xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{course?.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
          <Info size={16} className="text-[#0066FF] mt-0.5 shrink-0" />
          <p className="text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">How XP works:</span> You earn XP only on your{" "}
            <span className="font-semibold">first attempt</span> at a quiz, and only if you{" "}
            <span className="font-semibold">score 75% or higher</span>. A quiz is marked{" "}
            <span className="font-semibold">completed</span> once you pass it — retakes help you
            practice but won't earn extra XP.
          </p>
        </div>

        {subjects.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">
            No subjects have been added to this course yet.
          </p>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject) => (
              <div key={subject._id}>
                <h2 className="font-display font-semibold text-gray-900 mb-3">{subject.title}</h2>

                {subject.quizzes.length === 0 ? (
                  <p className="text-sm text-gray-400 pl-1">No quizzes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {subject.quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className={`w-full flex items-center justify-between bg-white border rounded-xl px-4 py-3.5 hover:shadow-sm transition-all ${
                          quiz.isCompleted
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-gray-100 hover:border-[#0066FF]"
                        }`}
                      >
                        <button
                          onClick={() => navigate(`/quiz/${quiz._id}`)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              quiz.isCompleted ? "bg-emerald-100" : "bg-blue-50"
                            }`}
                          >
                            {quiz.isCompleted ? (
                              <CheckCircle2 size={17} className="text-emerald-600" />
                            ) : (
                              <PlayCircle size={17} className="text-[#0066FF]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 text-sm">{quiz.title}</p>
                              {quiz.isCompleted && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {quiz.duration} min
                              </span>
                              <span className="capitalize">{quiz.difficulty}</span>
                              <span>{quiz.totalQuestions} questions</span>
                              {quiz.bestScore !== null && (
                                <span className={quiz.isCompleted ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                                  Best: {quiz.bestScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/multiplayer/host/${quiz._id}`)}
                            className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1.5 rounded-lg hover:bg-violet-100 transition-colors mr-2 shrink-0"
                            title="Host a live multiplayer round"
                          >
                            <Users size={13} /> Host
                          </button>
                        )}
                        <ChevronRight size={18} className="text-gray-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
