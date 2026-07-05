import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", { email, ...form });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600">
            No email found.{" "}
            <Link to="/forgot-password" className="text-[#0066FF] hover:underline">
              Start over
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter the OTP sent to <span className="font-medium">{email}</span> and your new password
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              required
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
