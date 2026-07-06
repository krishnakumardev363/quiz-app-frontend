import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

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
  const accent = getAccent(course.category);

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
    </div>
  );
}
