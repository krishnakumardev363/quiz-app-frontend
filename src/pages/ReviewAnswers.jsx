import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft } from "lucide-react";

export default function ReviewAnswers() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No review data available.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#0066FF] text-sm font-medium hover:underline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium hover:text-gray-600 mb-1"
          >
            <ArrowLeft size={13} /> Dashboard
          </button>
          <h1 className="font-display text-lg font-bold text-gray-900">Review Answers</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {result.answers.map((answer, idx) => {
          const isSkipped = answer.selectedAnswer === null;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400">Question {idx + 1}</p>
                {answer.isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={14} /> Correct
                  </span>
                ) : isSkipped ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                    <MinusCircle size={14} /> Skipped
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                    <XCircle size={14} /> Incorrect
                  </span>
                )}
              </div>

              <div className="text-sm space-y-2">
                <p className="text-gray-500">
                  Your answer:{" "}
                  <span
                    className={`font-medium ${
                      isSkipped
                        ? "text-gray-400 italic"
                        : answer.isCorrect
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {isSkipped ? "Not answered" : answer.selectedAnswer}
                  </span>
                </p>
                {!answer.isCorrect && (
                  <p className="text-gray-500">
                    Correct answer:{" "}
                    <span className="font-medium text-emerald-600">{answer.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
