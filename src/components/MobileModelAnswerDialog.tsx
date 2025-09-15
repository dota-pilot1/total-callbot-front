import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { examApi, type SampleAnswer } from "../features/chatbot/exam/api/exam";

interface MobileModelAnswerDialogProps {
  open: boolean;
  onClose: () => void;
  question: string;
  topic?: string;
  level?: string; // optional for future wiring
}

export default function MobileModelAnswerDialog({
  open,
  onClose,
  question,
  topic,
  level,
}: MobileModelAnswerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SampleAnswer[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      setAnswers([]);
      try {
        const resp = await examApi.getSampleAnswers({
          question,
          topic,
          level,
          count: 2,
        });
        if (!cancelled) setAnswers(resp.samples || []);
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || "모범 답변을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, question, topic, level]);

  useEffect(() => {
    try {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    } catch {}
  }, [answers, loading]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 top-0 bottom-0 bg-card border-t md:border border-border shadow-xl rounded-none md:rounded-t-xl md:top-auto md:bottom-0"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="font-semibold text-foreground">모범 답변 예시</div>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-muted/30 text-muted-foreground"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="px-4 py-3 h-[70vh] overflow-y-auto">
              {/* Question bubble */}
              <div className="mb-3 flex justify-start">
                <div className="max-w-[85%] bg-muted/20 text-foreground border border-border rounded-lg px-3 py-2 whitespace-pre-wrap">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    질문
                  </div>
                  {question}
                </div>
              </div>

              {/* Loading / Error */}
              {loading && (
                <div className="text-center text-gray-500 py-6">
                  예시 답변 생성 중...
                </div>
              )}
              {error && (
                <div className="text-center text-red-600 py-6">{error}</div>
              )}

              {/* Answers as chat-like bubbles */}
              {answers.map((a, idx) => (
                <div key={idx} className="mb-3 flex justify-end">
                  <div className="max-w-[85%] bg-card border border-border rounded-lg px-3 py-2 whitespace-pre-wrap">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      {a.title || `Ex${idx + 1}`}
                    </div>
                    {a.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
