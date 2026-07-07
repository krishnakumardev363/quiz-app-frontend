import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import api from "../api/axios";

// Loads the Razorpay checkout script once, on demand
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function XpStore() {
  const [packages, setPackages] = useState([]);
  const [currentXp, setCurrentXp] = useState(0);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/xp-store/packages").then((res) => setPackages(res.data));
    api.get("/auth/me").then((res) => setCurrentXp(res.data.xp));
  }, []);

  const handleBuy = async (pkg) => {
    setError("");
    setMessage("");
    setLoadingId(pkg.id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load payment gateway. Check your internet connection.");
        setLoadingId(null);
        return;
      }

      const { data } = await api.post("/xp-store/create-order", { packageId: pkg.id });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "DeagleTech",
        description: `${pkg.xp} XP Top-up`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/xp-store/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setMessage(verifyRes.data.message);
            setCurrentXp(verifyRes.data.newXp);
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed.");
          } finally {
            setLoadingId(null);
          }
        },
        modal: {
          ondismiss: () => setLoadingId(null),
        },
        theme: { color: "#0066FF" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment.");
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-gray-900 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-200 mb-2"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={22} className="text-amber-400" />
            XP Store
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            You currently have <span className="text-white font-semibold">{currentXp} XP</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-3">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm font-medium px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <Zap size={22} className="text-amber-500" />
              </div>
              <p className="font-display text-2xl font-bold text-gray-900">{pkg.xp} XP</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">₹{pkg.amountInr}</p>
              <button
                onClick={() => handleBuy(pkg)}
                disabled={loadingId === pkg.id}
                className="w-full flex items-center justify-center gap-1.5 bg-[#0066FF] text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loadingId === pkg.id ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Processing...
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Payments are processed securely via Razorpay. XP is added to your account instantly after payment.
        </p>
      </div>
    </div>
  );
}
