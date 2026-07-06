import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Flame, Medal } from "lucide-react";
import api from "../api/axios";

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leaderboard/global")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading leaderboard...</p>
      </div>
    );
  }

  const medalColors = ["text-amber-500", "text-gray-400", "text-amber-700"];

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
          <h1 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Leaderboard
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {data?.myRank && (
          <div className="bg-[#0066FF] text-white rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
            <span className="text-sm font-medium">Your rank</span>
            <span className="font-display text-2xl font-bold">#{data.myRank}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {data?.leaderboard?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No rankings yet.</p>
          ) : (
            data.leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {entry.rank <= 3 ? (
                      <Medal size={18} className={medalColors[entry.rank - 1]} />
                    ) : (
                      <span className="text-sm font-semibold text-gray-400">{entry.rank}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Flame size={11} className="text-orange-400" /> {entry.streak} day streak
                    </div>
                  </div>
                </div>
                <span className="font-display font-bold text-[#0066FF] text-sm">
                  {entry.xp} XP
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
