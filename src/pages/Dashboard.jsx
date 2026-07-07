import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Trophy, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, statsRes, enrollRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/courses/dashboard/stats"),
          api.get("/courses/my-enrollments"),
        ]);
        setUser(meRes.data);
        setStats(statsRes.data);
        setEnrollments(enrollRes.data);
      } catch (err) {
        setError("Could not load dashboard. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
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

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen dark:bg-gray-950 transition-colors">
      {/* Hero */}
      <div className="bg-gray-900 px-6 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#0066FF] opacity-20 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <p className="text-blue-300 text-sm font-medium">Welcome back</p>
              <h1 className="font-display text-3xl font-bold text-white mt-1">
                Hi, {firstName}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 bg-amber-400/20 backdrop-blur px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-amber-300 hover:bg-amber-400/30 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/history"
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                History
              </Link>
              <Link
                to="/multiplayer"
                className="flex items-center gap-1.5 bg-violet-400/20 backdrop-blur px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-violet-200 hover:bg-violet-400/30 transition-colors"
              >
                Join Multiplayer
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <Trophy size={15} className="text-amber-400" />
                Leaderboard
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Profile
              </Link>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 sm:px-4 py-2 rounded-full">
                <Flame size={16} className="text-[var(--color-accent)]" strokeWidth={2.5} />
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {stats?.streak ?? 0} day streak
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Stats - overlapping hero */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Trophy} label="XP earned" value={stats?.xp ?? 0} accent="text-amber-500 bg-amber-50" />
          <StatCard icon={TrendingUp} label="Avg. score" value={`${stats?.avgScore ?? 0}%`} accent="text-emerald-500 bg-emerald-50" />
          <StatCard icon={BookOpen} label="Exams done" value={stats?.totalCompleted ?? 0} accent="text-[#0066FF] bg-blue-50" />
          <StatCard icon={BookOpen} label="Courses" value={stats?.enrolledCourseCount ?? 0} accent="text-violet-500 bg-violet-50" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">My Courses</h2>
          <Link
            to="/courses"
            className="flex items-center gap-1 text-sm text-[#0066FF] font-semibold hover:gap-1.5 transition-all"
          >
            Browse all courses <ArrowRight size={14} />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={22} className="text-[#0066FF]" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium mb-1">No courses yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Enroll in a course to start your first quiz.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition-colors"
            >
              Browse Courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enrollments.map((enr) => (
              <CourseCard
                key={enr._id}
                course={enr.courseId}
                isEnrolled={true}
                progressPercent={enr.progressPercent}
                onEnroll={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={17} strokeWidth={2.5} />
      </div>
      <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
