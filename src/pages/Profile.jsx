import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, Award, Flame, AlertTriangle } from "lucide-react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/courses/profile/stats"),
        ]);
        setUser(meRes.data);
        setStats(statsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-1"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <h1 className="font-display text-xl font-bold text-gray-900">{user?.name}'s Profile</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* XP + Streak */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="font-display text-3xl font-bold text-[#0066FF]">{stats?.xp ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total XP earned</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-1.5">
              <Flame size={20} className="text-orange-400" />
              <p className="font-display text-3xl font-bold text-gray-900">{stats?.streak ?? 0}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Day streak</p>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-display font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
            <Award size={16} className="text-amber-500" /> Badges
          </h2>
          {stats?.badges?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No badges earned yet. Keep completing quizzes!</p>
          )}
        </div>

        {/* Score trend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-display font-semibold text-gray-900 text-sm mb-4">
            Score trend over time
          </h2>
          {stats?.scoreTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="scorePercent"
                  stroke="#0066FF"
                  strokeWidth={2.5}
                  dot={{ fill: "#0066FF", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400">Complete a quiz to see your progress here.</p>
          )}
        </div>

        {/* Weak topics */}
        {stats?.weakTopics?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h2 className="font-display font-semibold text-amber-900 text-sm mb-2 flex items-center gap-1.5">
              <AlertTriangle size={16} /> Topics to review
            </h2>
            <div className="flex flex-wrap gap-2">
              {stats.weakTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-white text-amber-700 px-3 py-1.5 rounded-full border border-amber-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
