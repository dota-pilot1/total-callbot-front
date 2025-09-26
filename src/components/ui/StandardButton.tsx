import React from "react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

interface StandardButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  fullWidth?: boolean;
  height?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

/**
 * 표준화된 버튼 컴포넌트 - 일관된 크기와 스타일 제공
 */
export function StandardButton({
  children,
  fullWidth = false,
  height = "md",
  icon,
  iconPosition = "left",
  className,
  ...props
}: StandardButtonProps) {
  const heightClasses = {
    sm: "h-9",
    md: "h-10",
    lg: "h-12",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Button
      className={cn(
        heightClasses[height],
        fullWidth && "w-full",
        "flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className={iconSizeClasses[height]}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className={iconSizeClasses[height]}>
          {icon}
        </span>
      )}
    </Button>
  );
}
