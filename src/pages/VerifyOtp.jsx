import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/verify-otp", { email, otp });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await api.post("/auth/resend-otp", { email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600">
            No email found. Please sign up or log in again to receive an OTP.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your account</h1>
        <p className="text-gray-500 text-sm mb-6">
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full text-center text-sm text-[#0066FF] mt-4 hover:underline disabled:opacity-60"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
