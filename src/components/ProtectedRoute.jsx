import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

/**
 * Wraps a page and ensures the user is logged in before rendering it.
 * Pass requireAdmin to also require role === "admin" - non-admins get
 * redirected to the student dashboard instead of seeing the admin UI.
 */
export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const [status, setStatus] = useState("checking"); // checking | ok | unauthorized | forbidden

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        if (requireSuperAdmin && res.data.role !== "admin") {
          setStatus("forbidden");
        } else if (requireAdmin && !["admin", "staff"].includes(res.data.role)) {
          setStatus("forbidden");
        } else {
          setStatus("ok");
        }
      })
      .catch(() => setStatus("unauthorized"));
  }, [requireAdmin, requireSuperAdmin]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
