import React from "react";
import { Button } from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showCloseButton?: boolean;
  headerAction?: React.ReactNode;
}

interface DialogActionsProps {
  children: React.ReactNode;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  showCloseButton = true,
  headerAction,
}: DialogProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-lg border shadow-lg ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerAction}
            {showCloseButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function DialogActions({ children }: DialogActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
      {children}
    </div>
  );
}

export default Dialog;
