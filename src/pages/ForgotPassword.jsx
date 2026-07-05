import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you an OTP to reset it
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-[#0066FF] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
