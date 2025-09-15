import { forwardRef } from "react";
import type { ReactNode, MouseEvent } from "react";

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      children,
      className = "",
      disabled = false,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const handleRipple = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
        transform: scale(0);
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        animation: ripple-animation 0.6s linear;
      `;

      // CSS-in-JS로 애니메이션 정의
      if (!document.querySelector("#ripple-styles")) {
        const style = document.createElement("style");
        style.id = "ripple-styles";
        style.textContent = `
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);

      // 원래 onClick 핸들러 실행
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`relative overflow-hidden ${className}`}
        onClick={handleRipple}
        {...props}
      >
        {children}
      </button>
    );
  },
);

RippleButton.displayName = "RippleButton";

export default RippleButton;
