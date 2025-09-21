import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface FullSlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  disabled?: boolean;
}

export default function FullSlideDialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  disabled = false
}: FullSlideDialogProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, disabled, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <h1 className="text-lg font-semibold text-foreground truncate">
          {title}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={disabled}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border bg-card p-4">
          {footer}
        </div>
      )}
    </div>
  );
}
