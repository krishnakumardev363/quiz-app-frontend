import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookText, ChevronRight, ChevronLeft, Check, Lock, Copy } from "lucide-react";
import api from "../api/axios";

// ============ CONTENT PARSING ============
// Lesson content is stored as plain text. Supported inline conventions:
//  - Short standalone lines (no trailing period/comma, under 60 chars) = headings
//  - ```fenced code blocks``` = code (preferred, used by AI-generated lessons)
//  - Un-fenced but code-shaped lines (older content) are still detected and
//    rendered as code, so existing lessons don't need to be regenerated
//  - ![alt](url) on its own line = an inline image

const isHeadingLine = (line) =>
  line.length > 0 && line.length < 60 && !line.endsWith(".") && !line.endsWith(",") && !line.startsWith("```");

const CODE_HINT_RE = /^(def |import |from |class |print\(|for |if |while |const |let |var |function |return\b|#include|public |private |void |int |SELECT |INSERT |UPDATE |DELETE )/i;

// Heuristic fallback for code written without ``` fences (older AI content):
// treat a multi-line paragraph as code if most of its lines look code-shaped.
function looksLikeCode(lines) {
  if (lines.length < 2) return false;
  const codeish = lines.filter(
    (l) => /[a-zA-Z0-9_\]"']\s*=(?!=)\s*\S/.test(l) || CODE_HINT_RE.test(l.trim()) || /[{}();]\s*$/.test(l.trim())
  );
  return codeish.length / lines.length >= 0.5;
}

const IMAGE_RE = /^!\[([^\]]*)\]\((\S+)\)$/;

const countWords = (text) => text.split(/\s+/).filter(Boolean).length;

// Parse the whole lesson content into a flat list of typed blocks:
// { type: "heading" | "paragraph" | "code" | "image", ... , weight }
// "weight" is an approximate reading-effort score used for pagination.
function parseBlocks(content) {
  const rawParagraphs = content
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .filter((p) => p.trim());

  const blocks = [];

  for (const para of rawParagraphs) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Fenced code block (may be the whole paragraph)
    if (lines[0].startsWith("```")) {
      const codeLines = [];
      let inFence = false;
      for (const l of lines) {
        if (l.startsWith("```")) {
          inFence = !inFence;
          continue;
        }
        codeLines.push(l);
      }
      if (codeLines.length > 0) {
        blocks.push({ type: "code", code: codeLines.join("\n"), weight: Math.max(codeLines.length * 6, 20) });
        continue;
      }
    }

    // Standalone image line
    if (lines.length === 1) {
      const m = lines[0].match(IMAGE_RE);
      if (m) {
        blocks.push({ type: "image", alt: m[1], url: m[2], weight: 40 });
        continue;
      }
    }

    // Un-fenced code (older content), checked BEFORE heading detection -
    // otherwise a code paragraph's first line (e.g. "age = 30") can get
    // misread as a heading, since it also has no trailing punctuation.
    if (looksLikeCode(lines)) {
      blocks.push({ type: "code", code: lines.join("\n"), weight: Math.max(lines.length * 6, 20) });
      continue;
    }

    // Heading + body written in the same paragraph
    if (lines.length > 1 && isHeadingLine(lines[0])) {
      const bodyLines = lines.slice(1);
      blocks.push({ type: "heading", text: lines[0], weight: 3 });
      if (looksLikeCode(bodyLines)) {
        blocks.push({ type: "code", code: bodyLines.join("\n"), weight: Math.max(bodyLines.length * 6, 20) });
      } else {
        const text = bodyLines.join(" ");
        blocks.push({ type: "paragraph", text, weight: countWords(text) });
      }
      continue;
    }

    // Heading alone in its own paragraph
    if (lines.length === 1 && isHeadingLine(lines[0])) {
      blocks.push({ type: "heading", text: lines[0], weight: 3 });
      continue;
    }

    // Plain paragraph
    const text = lines.join(" ");
    blocks.push({ type: "paragraph", text, weight: countWords(text) });
  }

  return blocks;
}

// Group blocks into pages using a word/effort budget per page, instead of
// one page per heading. Never splits a single block across two pages.
const WORDS_PER_PAGE = 200;

function paginateBlocks(blocks) {
  const pages = [];
  let current = [];
  let currentWeight = 0;

  for (const block of blocks) {
    if (current.length > 0 && currentWeight + block.weight > WORDS_PER_PAGE) {
      pages.push(current);
      current = [];
      currentWeight = 0;
    }
    current.push(block);
    currentWeight += block.weight;
  }
  if (current.length > 0) pages.push(current);
  if (pages.length === 0) pages.push([]);

  return pages;
}

// Reading timer scales with how much is actually on the page, instead of a
// flat 10 seconds regardless of length.
const READ_WPM = 950;
const MIN_READ_SECONDS = 8;
const MAX_READ_SECONDS = 180;

function pageReadSeconds(pageBlocks) {
  const totalWeight = pageBlocks.reduce((sum, b) => sum + b.weight, 0);
  const seconds = Math.round((totalWeight / READ_WPM) * 60);
  return Math.min(Math.max(seconds, MIN_READ_SECONDS), MAX_READ_SECONDS);
}

// ============ CODE BLOCK (with copy button) ============
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-gray-800 bg-[#0B1020]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5">
        <span className="text-[11px] text-gray-400 font-mono tracking-wide">CODE</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-[13px] leading-relaxed text-blue-100 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ============ BLOCK RENDERER ============
function LessonBlock({ block }) {
  if (block.type === "heading") {
    return (
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0066FF] mt-7 first:mt-0 mb-3">
        {block.text}
      </h2>
    );
  }
  if (block.type === "code") {
    return <CodeBlock code={block.code} />;
  }
  if (block.type === "image") {
    return (
      <img
        src={block.url}
        alt={block.alt || ""}
        loading="lazy"
        className="w-full rounded-xl my-4 border border-gray-100"
      />
    );
  }
  return (
    <p className="text-[15px] sm:text-base text-gray-700 leading-[1.8] sm:leading-[1.9] mb-4 whitespace-pre-line">
      {block.text}
    </p>
  );
}

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
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
        setPages(paginateBlocks(parseBlocks(res.data.content)));
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load lesson."))
      .finally(() => setLoading(false));
  }, [lessonId]);

  // Per-page read timer, scaled to how much content is actually on that
  // page. Resets on page change, unless that page was already unlocked
  // earlier in this session (so going back and forth doesn't force re-waiting).
  useEffect(() => {
    if (pages.length === 0) return;

    if (unlockedPages.has(pageIndex)) {
      setSecondsLeft(0);
      return;
    }

    const duration = pageReadSeconds(pages[pageIndex] || []);
    setSecondsLeft(duration);
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
  }, [pageIndex, pages]);

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

  const currentPageBlocks = pages[pageIndex] || [];
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
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
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

      {/* Content - centered, comfortable reading width, height grows automatically */}
      <div className="flex-1 px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 min-h-[280px]">
            {currentPageBlocks.map((block, idx) => (
              <LessonBlock key={idx} block={block} />
            ))}
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
