import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, UserCog, Shield, GraduationCap, User } from "lucide-react";
import api from "../api/axios";

const ROLE_STYLES = {
  admin: { label: "Admin", icon: Shield, color: "text-red-600 bg-red-50" },
  staff: { label: "Staff", icon: GraduationCap, color: "text-violet-600 bg-violet-50" },
  student: { label: "Student", icon: User, color: "text-gray-600 bg-gray-100" },
};

export default function AdminUsers() {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get(`/admin/users/search?email=${encodeURIComponent(email)}`);
      setResults(res.data);
      if (res.data.length === 0) setMessage("No users found with that email.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setMessage(res.data.message);
      setResults((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update role.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-gray-900 px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-200 mb-2"
          >
            <ArrowLeft size={13} /> Admin Dashboard
          </Link>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <UserCog size={22} className="text-violet-400" />
            Manage Staff Access
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Search for a user by email and grant them staff (instructor) access.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email address"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Search size={15} /> {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {message && (
          <div className="mb-5 rounded-xl bg-blue-50 text-[#0066FF] text-sm font-medium px-4 py-3">
            {message}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {results.map((user) => {
              const roleInfo = ROLE_STYLES[user.role] || ROLE_STYLES.student;
              const RoleIcon = roleInfo.icon;
              return (
                <div
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.color}`}
                    >
                      <RoleIcon size={12} /> {roleInfo.label}
                    </span>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
