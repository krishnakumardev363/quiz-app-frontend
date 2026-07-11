import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import socket from "../api/socket";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await api.post("/auth/login", form);
      // ============ RE-AUTHENTICATE THE SHARED SOCKET ============
      // The shared socket (api/socket.js) auto-connects the instant its
      // module is first evaluated, which can happen on the Login page
      // itself - before the auth cookie exists. Socket.IO captures the
      // handshake cookies once and never refreshes them for that
      // connection's lifetime, so without this, every socket-authenticated
      // action (like hosting a quiz) would see a null user forever, even
      // after a successful login. Forcing a disconnect+reconnect here
      // makes the socket re-handshake with the cookie that was just set.
      socket.disconnect();
      socket.connect();
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";

      // If account not verified, redirect to OTP verification
      if (err.response?.status === 403 && err.response?.data?.email) {
        navigate("/verify-otp", { state: { email: err.response.data.email } });
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Log in to continue your learning journey</p>

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
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#0066FF] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#0066FF] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
