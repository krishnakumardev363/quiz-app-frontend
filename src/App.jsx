import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CourseBrowse from "./pages/CourseBrowse";
import CourseDetail from "./pages/CourseDetail";
import QuizAttempt from "./pages/QuizAttempt";
import Result from "./pages/Result";
import ReviewAnswers from "./pages/ReviewAnswers";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import ManageCourse from "./pages/ManageCourse";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Student routes - require login */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CourseBrowse /></ProtectedRoute>} />
        <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
        <Route path="/quiz/:quizId/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/quiz/:quizId/review" element={<ProtectedRoute><ReviewAnswers /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/courses/new"
          element={<ProtectedRoute requireAdmin><CreateCourse /></ProtectedRoute>}
        />
        <Route
          path="/admin/courses/:courseId/manage"
          element={<ProtectedRoute requireAdmin><ManageCourse /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
