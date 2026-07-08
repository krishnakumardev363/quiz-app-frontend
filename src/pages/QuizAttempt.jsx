import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [flagged, setFlagged] = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unreadLesson, setUnreadLesson] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const res = await api.get(`/quiz/${quizId}/start`);
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);
        setSecondsLeft(res.data.quiz.duration * 60);
      } catch (err) {
        setError(err.response?.data?.message || "Could not start quiz.");
        if (err.response?.status === 403 && err.response?.data?.unreadLessons?.length > 0) {
          setUnreadLesson(err.response.data.unreadLessons[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    startQuiz();
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        })),
        mode: "exam",
      };
      const res = await api.post(`/quiz/${quizId}/submit`, payload);
      navigate(`/quiz/${quizId}/result`, { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit quiz.");
      setSubmitting(false);
    }
  }, [answers, quizId, navigate, submitting]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null || loading) return;

    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsLeft, loading, handleSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          {unreadLesson && (
            <button
              onClick={() => navigate(`/lesson/${unreadLesson._id}`)}
              className="bg-[#0066FF] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition-colors"
            >
              Read "{unreadLesson.title}"
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLowTime = secondsLeft <= 60;

  const toggleFlag = (id) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getStatus = (index) => {
    const q = questions[index];
    if (flagged.has(q._id)) return "flagged";
    if (answers[q._id]) return "answered";
    return "unanswered";
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display font-semibold text-gray-900 text-sm truncate">{quiz.title}</p>
            <p className="text-xs text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0 ${
              isLowTime ? "bg-red-50 text-red-600" : "bg-blue-50 text-[#0066FF]"
            }`}
          >
            <Clock size={14} />
            {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-2">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-[#0066FF] h-1.5 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question card */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex justify-between items-start mb-5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide capitalize">
              {currentQuestion.difficulty} difficulty
            </span>
            <button
              onClick={() => toggleFlag(currentQuestion._id)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                flagged.has(currentQuestion._id)
                  ? "bg-amber-50 text-amber-600"
                  : "bg-gray-50 text-gray-400 hover:text-gray-600"
              }`}
            >
              <Flag size={12} /> {flagged.has(currentQuestion._id) ? "Flagged" : "Flag"}
            </button>
          </div>

          <p className="font-display font-semibold text-gray-900 text-lg mb-5">
            {currentQuestion.questionText}
          </p>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion._id] === option;
              return (
                <button
                  key={idx}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: option }))
                  }
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 disabled:opacity-40 hover:text-gray-900"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#0066FF] text-white text-sm font-semibold rounded-xl px-6 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
                className="flex items-center gap-1 text-sm font-medium text-[#0066FF] hover:gap-1.5 transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Question navigator */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 h-fit">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Questions
          </p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const status = getStatus(idx);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isCurrent
                      ? "ring-2 ring-[#0066FF] text-[#0066FF] bg-blue-50"
                      : status === "answered"
                      ? "bg-emerald-100 text-emerald-700"
                      : status === "flagged"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-gray-500">
            <LegendDot color="bg-emerald-500" label="Answered" />
            <LegendDot color="bg-amber-500" label="Flagged" />
            <LegendDot color="bg-gray-300" label="Skipped" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-4 bg-gray-900 text-white text-xs font-semibold rounded-lg py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}
