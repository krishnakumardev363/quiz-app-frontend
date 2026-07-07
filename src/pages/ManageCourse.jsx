import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Sparkles, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

export default function ManageCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get(`/admin/courses/${courseId}`);
      setCourse(res.data);
      const subRes = await api.get(`/admin/subjects/course/${courseId}`);
      setSubjects(subRes.data);
    } catch (err) {
      setMessage("Could not load course data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      await api.post("/admin/subjects", { courseId, title: newSubject });
      setNewSubject("");
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add subject.");
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Delete this subject and all its quizzes?")) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete subject.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-1"
          >
            <ArrowLeft size={13} /> Admin Dashboard
          </Link>
          <h1 className="font-display text-xl font-bold text-gray-900">{course?.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

        {/* Add subject */}
        <form onSubmit={handleAddSubject} className="flex gap-2 mb-6">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="New subject name (e.g. React Basics)"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-gray-800 transition-colors"
          >
            <Plus size={15} /> Add Subject
          </button>
        </form>

        {/* Subject list */}
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div key={subject._id} className="bg-white rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() =>
                    setExpandedSubject(expandedSubject === subject._id ? null : subject._id)
                  }
                  className="font-display font-semibold text-gray-900 text-sm flex-1 text-left"
                >
                  {subject.title}
                </button>
                <button
                  onClick={() => handleDeleteSubject(subject._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {expandedSubject === subject._id && (
                <>
                  <LessonManager subjectId={subject._id} />
                  <QuizManager subjectId={subject._id} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LessonManager({ subjectId }) {
  const [lessons, setLessons] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({ title: "", content: "" });
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/admin/lessons/subject/${subjectId}`);
      setLessons(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [subjectId]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/lessons", { ...manualForm, subjectId });
      setManualForm({ title: "", content: "" });
      setShowManualForm(false);
      fetchLessons();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add lesson.");
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setMessage("");
    try {
      const res = await api.post("/admin/lessons/generate-ai", { subjectId, topic: aiTopic });
      setMessage(res.data.message);
      setAiTopic("");
      fetchLessons();
    } catch (err) {
      setMessage(err.response?.data?.message || "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await api.delete(`/admin/lessons/${id}`);
      fetchLessons();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete lesson.");
    }
  };

  if (loading) return <p className="px-5 pb-2 text-xs text-gray-400">Loading lessons...</p>;

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
        Lesson Content ({lessons.length})
      </p>
      {message && <p className="text-xs text-blue-600 mb-2">{message}</p>}

      {lessons.map((lesson) => (
        <div key={lesson._id} className="mb-2">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
            <button
              onClick={() =>
                setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)
              }
              className="text-sm font-medium text-gray-800 flex-1 text-left flex items-center gap-2"
            >
              {lesson.title}
              {lesson.source === "ai" && (
                <span className="text-[10px] font-semibold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              )}
            </button>
            <button onClick={() => handleDelete(lesson._id)} className="p-1 text-gray-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          </div>
          {expandedLesson === lesson._id && (
            <p className="text-xs text-gray-600 mt-2 ml-2 whitespace-pre-line leading-relaxed">
              {lesson.content}
            </p>
          )}
        </div>
      ))}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setShowManualForm(!showManualForm)}
          className="text-xs font-medium text-[#0066FF] hover:underline flex items-center gap-1"
        >
          <Plus size={12} /> Add manually
        </button>
      </div>

      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-gray-50 rounded-lg p-3 space-y-2 mt-2">
          <input
            value={manualForm.title}
            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            placeholder="Lesson title"
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          <textarea
            value={manualForm.content}
            onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
            placeholder="Lesson content / study notes"
            required
            rows={4}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          <button type="submit" className="bg-gray-900 text-white text-xs font-semibold rounded-md px-3 py-1.5">
            Save Lesson
          </button>
        </form>
      )}

      <div className="bg-violet-50 rounded-lg p-3 mt-3">
        <p className="text-xs font-semibold text-violet-700 mb-2 flex items-center gap-1">
          <Sparkles size={12} /> Generate lesson content with AI
        </p>
        <form onSubmit={handleGenerateAI} className="flex flex-wrap gap-2">
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Topic (e.g. React Hooks)"
            required
            className="flex-1 min-w-[150px] rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="bg-violet-600 text-white text-xs font-semibold rounded-md px-3 py-1.5 disabled:opacity-60"
          >
            {aiLoading ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>
    </div>
  );
}

function QuizManager({ subjectId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", difficulty: "medium", duration: 10, negativeMarking: false });
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/admin/quizzes/subject/${subjectId}`);
      setQuizzes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/quizzes", { ...form, subjectId });
      setForm({ title: "", difficulty: "medium", duration: 10, negativeMarking: false });
      setShowForm(false);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create quiz.");
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz and its questions?")) return;
    try {
      await api.delete(`/admin/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete quiz.");
    }
  };

  if (loading) return <p className="px-5 pb-4 text-xs text-gray-400">Loading quizzes...</p>;

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      {quizzes.map((quiz) => (
        <div key={quiz._id} className="mb-2">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
            <button
              onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}
              className="text-sm font-medium text-gray-800 flex-1 text-left"
            >
              {quiz.title} <span className="text-xs text-gray-400">({quiz.totalQuestions} Qs)</span>
            </button>
            <button
              onClick={() => handleDeleteQuiz(quiz._id)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          </div>
          {expandedQuiz === quiz._id && <QuestionManager quizId={quiz._id} />}
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleCreateQuiz} className="mt-3 space-y-2 bg-blue-50/50 rounded-lg p-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Quiz title (e.g. Chapter 1 Test)"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="rounded-md border border-gray-300 px-2 py-2 text-xs"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              placeholder="Duration (min)"
              className="w-32 rounded-md border border-gray-300 px-2 py-2 text-xs"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={form.negativeMarking}
                onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })}
              />
              Negative marking
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="bg-[#0066FF] text-white text-xs font-semibold rounded-md px-3 py-1.5"
            >
              Save Quiz
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-[#0066FF] hover:underline"
        >
          <Plus size={13} /> Add Quiz
        </button>
      )}
    </div>
  );
}

function QuestionManager({ quizId }) {
  const [questions, setQuestions] = useState([]);
  const [pendingAI, setPendingAI] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    difficulty: "medium",
  });
  const [aiForm, setAiForm] = useState({ topic: "", difficulty: "medium", count: 5 });
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchQuestions = async () => {
    const res = await api.get(`/admin/questions/quiz/${quizId}`);
    setQuestions(res.data.filter((q) => q.isPublished));
    setPendingAI(res.data.filter((q) => !q.isPublished));
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/questions", { ...manualForm, quizId });
      setManualForm({ questionText: "", options: ["", "", "", ""], correctAnswer: "", difficulty: "medium" });
      setShowManualForm(false);
      fetchQuestions();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add question.");
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setMessage("");
    try {
      const res = await api.post("/admin/ai-questions/generate", { ...aiForm, quizId });
      setMessage(res.data.message);
      fetchQuestions();
    } catch (err) {
      setMessage(err.response?.data?.message || "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    try {
      await api.put("/admin/ai-questions/bulk-publish", { quizId });
      fetchQuestions();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not publish.");
    }
  };

  const handleRejectAI = async (id) => {
    try {
      await api.delete(`/admin/ai-questions/${id}`);
      fetchQuestions();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not reject question.");
    }
  };

  return (
    <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-100 space-y-3">
      {message && <p className="text-xs text-blue-600">{message}</p>}

      <p className="text-xs font-semibold text-gray-400 uppercase">
        Published questions ({questions.length})
      </p>
      {questions.map((q) => (
        <p key={q._id} className="text-xs text-gray-600">
          • {q.questionText}
        </p>
      ))}

      {pendingAI.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-amber-700">
              {pendingAI.length} AI questions pending review
            </p>
            <button
              onClick={handleBulkPublish}
              className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full hover:bg-emerald-200"
            >
              Publish all
            </button>
          </div>
          {pendingAI.map((q) => (
            <div key={q._id} className="flex justify-between items-start text-xs text-gray-600 mb-1.5">
              <span className="flex-1">• {q.questionText}</span>
              <button
                onClick={() => handleRejectAI(q._id)}
                className="text-red-500 hover:underline ml-2 shrink-0"
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowManualForm(!showManualForm)}
          className="text-xs font-medium text-[#0066FF] hover:underline flex items-center gap-1"
        >
          <Plus size={12} /> Add manually
        </button>
      </div>

      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <input
            value={manualForm.questionText}
            onChange={(e) => setManualForm({ ...manualForm, questionText: e.target.value })}
            placeholder="Question text"
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          {manualForm.options.map((opt, idx) => (
            <input
              key={idx}
              value={opt}
              onChange={(e) => {
                const opts = [...manualForm.options];
                opts[idx] = e.target.value;
                setManualForm({ ...manualForm, options: opts });
              }}
              placeholder={`Option ${idx + 1}`}
              required
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
            />
          ))}
          <input
            value={manualForm.correctAnswer}
            onChange={(e) => setManualForm({ ...manualForm, correctAnswer: e.target.value })}
            placeholder="Correct answer (must match an option exactly)"
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          <button type="submit" className="bg-gray-900 text-white text-xs font-semibold rounded-md px-3 py-1.5">
            Save Question
          </button>
        </form>
      )}

      <div className="bg-violet-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-violet-700 mb-2 flex items-center gap-1">
          <Sparkles size={12} /> Generate with AI
        </p>
        <form onSubmit={handleGenerateAI} className="flex flex-wrap gap-2">
          <input
            value={aiForm.topic}
            onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
            placeholder="Topic (e.g. JavaScript Closures)"
            required
            className="flex-1 min-w-[150px] rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          <select
            value={aiForm.difficulty}
            onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="number"
            value={aiForm.count}
            onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
            className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="bg-violet-600 text-white text-xs font-semibold rounded-md px-3 py-1.5 disabled:opacity-60"
          >
            {aiLoading ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>
    </div>
  );
}
