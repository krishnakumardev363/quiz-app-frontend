import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";

export default function CourseBrowse() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/my-enrollments"),
      ]);
      setCourses(coursesRes.data);
      setEnrolledIds(new Set(enrollRes.data.map((e) => e.courseId?._id)));
    } catch (err) {
      setMessage("Could not load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setMessage("Enrolled successfully!");
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not enroll.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-1"
            >
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <h1 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
              <Compass size={20} className="text-[#0066FF]" />
              Browse Courses
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-5 rounded-xl bg-blue-50 text-[#0066FF] text-sm font-medium px-4 py-3">
            {message}
          </div>
        )}

        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={enrolledIds.has(course._id)}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

