import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FullScreenSlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export default function FullScreenSlideDialog({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  showCloseButton = true,
}: FullScreenSlideDialogProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // 배경 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // 배경 클릭으로 닫기 (헤더 영역에서만)
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

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
            className="fixed inset-0 bg-white z-40"
            onClick={handleBackdropClick}
          />

          {/* 떨어지는 다이얼로그 */}
          <motion.div
            initial={{
              y: "-150%",
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              y: "-120%",
              scale: 0.9,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200,
              mass: 0.8,
            }}
            className={`fixed inset-0 z-50 flex flex-col bg-background ${className}`}
          >
            {/* 헤더 영역 */}
            <div className="flex-shrink-0 bg-white border-b border-border shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                {/* 제목 */}
                <div className="flex items-center">
                  {title && (
                    <h2 className="text-lg font-semibold text-foreground">
                      {title}
                    </h2>
                  )}
                </div>

                {/* 닫기 버튼 */}
                {showCloseButton && (
                  <button
                    onClick={(e) => {
                      console.log("🔴 FullScreenSlideDialog 닫기 버튼 클릭됨");
                      console.log("🔴 onClose 함수:", onClose);
                      console.log("🔴 이벤트:", e);
                      e.preventDefault();
                      e.stopPropagation();
                      onClose();
                    }}
                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="닫기"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>

              {/* 드래그 인디케이터 (모바일용) */}
              <div className="flex justify-center pb-2 sm:hidden">
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 사용 예시와 타입 export
export type { FullScreenSlideDialogProps };
