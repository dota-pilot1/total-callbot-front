import React from "react";
import { cn } from "../../lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "sm" | "md" | "lg";
}

/**
 * 페이지 전체 컨테이너 - 일관된 패딩과 최대 너비 제공
 */
export function PageContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = "lg",
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-none",
  };

  const paddingClasses = {
    sm: "p-4 space-y-4",
    md: "p-5 space-y-5",
    lg: "p-6 space-y-6",
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding]
        )}
      >
        {children}
      </div>
    </div>
  );
}
