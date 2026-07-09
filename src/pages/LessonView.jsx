import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookText, ChevronRight, ChevronLeft, Check, Lock } from "lucide-react";
import api from "../api/axios";

const READ_TIME_SECONDS = 60;

const isHeadingLine = (line) =>
  line.length > 0 && line.length < 60 && !line.endsWith(".") && !line.endsWith(",");

const parsePages = (content) => {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const pages = [];
  let i = 0;

  while (i < paragraphs.length) {
    const lines = paragraphs[i].split("\n").map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || "";

    if (lines.length > 1 && isHeadingLine(firstLine)) {
      // Heading and body written in the same paragraph
      pages.push({ heading: firstLine, body: lines.slice(1).join(" ") });
      i += 1;
    } else if (lines.length === 1 && isHeadingLine(firstLine) && i + 1 < paragraphs.length) {
      // Heading on its own line, body is the NEXT paragraph - merge them into one page
      pages.push({ heading: firstLine, body: paragraphs[i + 1] });
      i += 2;
    } else {
      // Plain paragraph with no distinct heading
      pages.push({ heading: null, body: paragraphs[i] });
      i += 1;
    }
  }

  return pages;
};

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(READ_TIME_SECONDS);
  const [unlockedPages, setUnlockedPages] = useState(new Set([0]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);
  const [alreadyRead, setAlreadyRead] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api
      .get(`/courses/lessons/${lessonId}`)
      .then((res) => {
        setLesson(res.data);
        setPages(parsePages(res.data.content));
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load lesson."))
      .finally(() => setLoading(false));
  }, [lessonId]);

  // Per-page 60 second read timer. Resets on page change, unless that page
  // was already unlocked earlier in this session (so going back and forth
  // doesn't force re-waiting).
  useEffect(() => {
    if (pages.length === 0) return;

    if (unlockedPages.has(pageIndex)) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(READ_TIME_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setUnlockedPages((set) => new Set(set).add(pageIndex));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [pageIndex, pages.length]);

  const handleNext = () => {
    if (secondsLeft > 0) return;
    setPageIndex((i) => Math.min(i + 1, pages.length - 1));
  };

  const handlePrevious = () => {
    setPageIndex((i) => Math.max(i - 1, 0));
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      await api.post(`/courses/lessons/${lessonId}/complete`);
      setAlreadyRead(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your progress.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading lesson...</p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const currentPage = pages[pageIndex];
  const isLastPage = pageIndex === pages.length - 1;
  const isLocked = secondsLeft > 0;

  if (alreadyRead) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check size={26} className="text-emerald-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900 mb-2">Lesson Completed!</h1>
          <p className="text-sm text-gray-500 mb-6">
            You've read "{lesson.title}". The related quiz is now unlocked.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-[#0066FF] text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-blue-700 transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-2"
          >
            <ArrowLeft size={13} /> Back to course
          </button>
          <h1 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookText size={19} className="text-violet-600 shrink-0" />
            {lesson.title}
          </h1>

          {/* Page progress dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {pages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === pageIndex
                    ? "w-6 bg-[#0066FF]"
                    : unlockedPages.has(idx)
                    ? "w-1.5 bg-emerald-400"
                    : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Page {pageIndex + 1} of {pages.length}
          </p>
        </div>
      </div>

      {/* Content - centered, comfortable reading width across breakpoints */}
      <div className="flex-1 px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 min-h-[280px]">
            {currentPage?.heading && (
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0066FF] mb-4">
                {currentPage.heading}
              </h2>
            )}
            <p className="text-[15px] sm:text-base text-gray-700 leading-[1.8] sm:leading-[1.9] whitespace-pre-line">
              {currentPage?.body}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-4 sticky bottom-0">
        <div className="max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={pageIndex === 0}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 disabled:opacity-30 hover:text-gray-900"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {isLocked ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded-full">
              <Lock size={12} /> Next available in {secondsLeft}s
            </div>
          ) : isLastPage ? (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <Check size={16} /> {completing ? "Saving..." : "Mark as Complete"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
