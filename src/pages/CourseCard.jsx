import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Award } from "lucide-react";
import api from "../api/axios";
import ConfirmModal from "./ConfirmModal";

// Deterministic accent color per course, based on category name so it stays
// consistent across renders without needing to store a color in the DB.
const ACCENTS = [
  { bg: "bg-blue-50", text: "text-[#0066FF]", bar: "bg-[#0066FF]" },
  { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500" },
  { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
  { bg: "bg-violet-50", text: "text-violet-600", bar: "bg-violet-500" },
];

const getAccent = (key = "") => {
  const index = key.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % ACCENTS.length;
  return ACCENTS[index];
};

export default function CourseCard({ course, isEnrolled, progressPercent, onEnroll }) {
  // ============ NULL-SAFETY GUARD ============
  // course can be null if it came from a populated reference (e.g. an
  // Enrollment) whose target Course was deleted. Render nothing rather
  // than crash - the parent list should also filter these out, but this
  // guard protects the component even if a caller forgets to.
  if (!course) return null;

  const accent = getAccent(course.category);
  const navigate = useNavigate();

  // Modal state machine: null | "confirm-name" | "need-xp" | "generic-error"
  const [modal, setModal] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  const startDownload = async () => {
    try {
      const res = await api.get(`/certificate/${course._id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${course.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // Error responses come back as a Blob too (since responseType is blob) - parse it
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (err.response.status === 402) {
            setModalMessage(parsed.message);
            setModal("need-xp");
            return;
          }
          setModalMessage(parsed.message || "Could not download certificate.");
          setModal("generic-error");
          return;
        } catch {
          // fall through to generic error
        }
      }
      setModalMessage("Could not download certificate.");
      setModal("generic-error");
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-1.5 ${accent.bar}`} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${accent.text} ${accent.bg} px-2.5 py-1 rounded-full`}>
            <BookOpen size={12} strokeWidth={2.5} />
            {course.category}
          </span>
        </div>

        <Link to={`/course/${course._id}`}>
          <h3 className="font-display font-bold text-gray-900 text-[17px] leading-snug hover:text-[#0066FF] transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {isEnrolled ? (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-medium">Your progress</span>
              <span className="font-semibold text-gray-700">{progressPercent || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`${accent.bar} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progressPercent || 0}%` }}
              />
            </div>
            {progressPercent >= 100 && (
              <button
                onClick={() => setModal("confirm-name")}
                className="w-full mt-3 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg py-2 hover:bg-amber-100 transition-colors"
              >
                <Award size={14} /> Download Certificate
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onEnroll(course._id)}
            className="w-full mt-5 flex items-center justify-center gap-1.5 bg-gray-900 text-white text-sm font-semibold rounded-xl py-2.5 group-hover:bg-[#0066FF] transition-colors"
          >
            Enroll now
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <ConfirmModal
        open={modal === "confirm-name"}
        title="Double-check your name"
        message="Your name will appear exactly as shown in your Profile page on this certificate. Make sure it's correct before downloading."
        confirmLabel="Download"
        cancelLabel="Cancel"
        onCancel={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          startDownload();
        }}
      />

      <ConfirmModal
        open={modal === "need-xp"}
        title="More XP needed"
        message={modalMessage}
        confirmLabel="Visit XP Store"
        cancelLabel="Not now"
        tone="warning"
        onCancel={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          navigate("/xp-store");
        }}
      />

      <ConfirmModal
        open={modal === "generic-error"}
        title="Something went wrong"
        message={modalMessage}
        confirmLabel="OK"
        cancelLabel="Close"
        tone="warning"
        onCancel={() => setModal(null)}
        onConfirm={() => setModal(null)}
      />
    </div>
  );
}
