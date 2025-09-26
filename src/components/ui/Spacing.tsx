import React from "react";
import { cn } from "../../lib/utils";

interface SpacingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  className?: string;
}

/**
 * 표준화된 스페이싱 컴포넌트 - 일관된 간격 제공
 */
export function VStack({ size = "md", children, className }: SpacingProps) {
  const spacingClasses = {
    xs: "space-y-2",
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  };

  return (
    <div className={cn(spacingClasses[size], className)}>
      {children}
    </div>
  );
}

export function HStack({ size = "md", children, className }: SpacingProps) {
  const spacingClasses = {
    xs: "space-x-2",
    sm: "space-x-3",
    md: "space-x-4",
    lg: "space-x-6",
    xl: "space-x-8",
  };

  return (
    <div className={cn("flex items-center", spacingClasses[size], className)}>
      {children}
    </div>
  );
}

export function Spacer({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const heightClasses = {
    xs: "h-2",
    sm: "h-3",
    md: "h-4",
    lg: "h-6",
    xl: "h-8",
  };

  return <div className={heightClasses[size]} />;
}
