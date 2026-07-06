import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CourseBrowse />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/quiz/:quizId" element={<QuizAttempt />} />
        <Route path="/quiz/:quizId/result" element={<Result />} />
        <Route path="/quiz/:quizId/review" element={<ReviewAnswers />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
