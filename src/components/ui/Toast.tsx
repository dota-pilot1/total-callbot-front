import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 2000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 애니메이션 시작
    setTimeout(() => setIsAnimating(true), 10);

    // 자동 사라짐 타이머
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300); // 애니메이션 시간
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  if (!isVisible) return null;

  const toast = (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3
        transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={handleClose}
        className="p-1 hover:bg-black hover:bg-opacity-20 rounded"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return createPortal(toast, document.body);
}

// Toast 관리를 위한 훅
export interface ToastState {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: ToastState['type'] = 'info', duration = 2000) => {
    const id = Date.now().toString();
    const newToast: ToastState = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}
