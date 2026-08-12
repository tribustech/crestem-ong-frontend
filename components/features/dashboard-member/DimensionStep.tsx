"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDimensionBlock } from "@/lib/api/evaluations";

const DIMENSION_LETTERS = "ABCDEFGHIJ";

export function DimensionStep({
  dimension,
  dimensionIndex,
  block,
  saving,
  error,
  backLabel = "Înapoi la instrucțiuni",
  submitLabel = "Dimensiunea următoare",
  savingLabel = "Se trimite...",
  showSubmitIcon = true,
  onBack,
  onSubmit,
}: {
  dimension: Dimension;
  dimensionIndex: number;
  block?: EvaluationDimensionBlock;
  saving: boolean;
  error: string | null;
  backLabel?: string;
  submitLabel?: string;
  savingLabel?: string;
  showSubmitIcon?: boolean;
  onBack: () => void;
  onSubmit: (input: { comment: string; quiz: { questionId: string; answer: number }[] }) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (block?.quiz ?? [])
        .filter((q): q is typeof q & { answer: number } => q.answer != null)
        .map((q) => [q.questionId, q.answer]),
    ),
  );
  const [comment, setComment] = useState(block?.comment ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const letter = DIMENSION_LETTERS[dimensionIndex] ?? String(dimensionIndex + 1);
  const answeredCount = dimension.quiz.filter((question) => answers[question.id] != null).length;
  const allAnswered = answeredCount === dimension.quiz.length;
  const hasComment = comment.trim().length > 0;
  const canSubmit = allAnswered;

  const handleSubmit = () => {
    if (!allAnswered) {
      const message = "Răspunde la toate întrebările înainte de a trimite.";
      setValidationError(message);
      toast.error(message);
      return;
    }
    if (!hasComment) {
      const message = "Adaugă un comentariu înainte de a trimite.";
      setValidationError(message);
      toast.error(message);
      return;
    }
    setValidationError(null);
    onSubmit({
      comment: comment.trim(),
      quiz: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
    });
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#2dbe8f" }}>
        Dimensiunea {letter}
      </p>
      <h1 className="text-2xl font-heading font-extrabold mb-4" style={{ color: "#162040" }}>
        {letter}) {dimension.name}
      </h1>

      <div className="space-y-4 mb-4">
        {dimension.quiz.map((question, index) => {
          const selected = answers[question.id];
          return (
            <div key={question.id} className="bg-white rounded-2xl border border-border p-5">
              {question.tag && (
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#2dbe8f" }}>
                  {question.tag}
                </p>
              )}
              <p className="text-sm font-semibold mb-4" style={{ color: "#162040" }}>
                Q{index + 1}. {question.question}
              </p>
              <div className="space-y-1">
                {question.options.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <label
                      key={option.value}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
                      style={{ background: isSelected ? "#f0faf6" : "transparent" }}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }))}
                      />
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{
                          background: isSelected ? "#2dbe8f" : "#f1f5f9",
                          color: isSelected ? "white" : "#64748b",
                        }}
                      >
                        {option.value}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: isSelected ? "#162040" : "#475569", fontWeight: isSelected ? 600 : 400 }}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-20">
        <label htmlFor="dimension-comment" className="block text-sm font-semibold mb-3" style={{ color: "#162040" }}>
          Te rugăm să argumentezi selecția făcută pentru indicatorul „{dimension.name}”
          <span style={{ color: "#ef4444" }}> *</span>
        </label>
        <textarea
          id="dimension-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          aria-required="true"
          className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f]"
          placeholder="Descrie pe scurt raționamentul din spatele răspunsurilor tale..."
        />
        {(validationError || error) && (
          <p className="mt-3 text-sm" style={{ color: "#ef4444" }}>
            {validationError ?? error}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "#94a3b8" }}
        >
          <ArrowLeft size={14} /> {backLabel}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: "#94a3b8" }}>
            {answeredCount}/{dimension.quiz.length} răspunsuri
          </span>
          <button
            type="button"
            disabled={!canSubmit || saving}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#162040" }}
          >
            {saving ? savingLabel : submitLabel} {showSubmitIcon && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
