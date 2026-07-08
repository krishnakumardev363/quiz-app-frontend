import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  tone = "info", // info | warning
}) {
  if (!open) return null;

  const accentColor = tone === "warning" ? "text-amber-600 bg-amber-50" : "text-[#0066FF] bg-blue-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${accentColor}`}>
          Quizera
        </span>

        <h2 className="font-display text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm font-semibold text-white bg-[#0066FF] rounded-xl py-2.5 hover:bg-blue-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
