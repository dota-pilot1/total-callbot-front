import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FullScreenSlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function FullScreenSlideDialog({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: FullScreenSlideDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* 슬라이드 다이얼로그 패널 */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3,
            }}
            className={`fixed top-0 left-0 right-0 bg-card border-b border-border shadow-lg z-50 max-h-screen overflow-y-auto ${className}`}
          >
            <div className="p-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* 콘텐츠 */}
              <div className="pb-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
