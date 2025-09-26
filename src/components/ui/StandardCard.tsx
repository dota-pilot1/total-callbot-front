import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { cn } from "../../lib/utils";

interface StandardCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

/**
 * 표준화된 카드 컴포넌트 - 일관된 패딩과 스타일 제공
 */
export function StandardCard({
  children,
  title,
  className,
  contentClassName,
  padding = "lg",
  hover = false,
}: StandardCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  const headerPaddingClasses = {
    sm: "pb-3",
    md: "pb-4",
    lg: "pb-6",
  };

  return (
    <Card
      className={cn(
        "border-border",
        hover && "hover:shadow-md transition-all duration-200",
        className
      )}
    >
      {title && (
        <CardHeader className={headerPaddingClasses[padding]}>
          <CardTitle className="text-xl font-semibold text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          paddingClasses[padding],
          title && "pt-0",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
