import * as React from "react";

import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, className, children, ...props }, ref) => {
    const normalizedMax = max <= 0 ? 100 : max;
    const clampedValue = Math.min(Math.max(value, 0), normalizedMax);
    const percentage = (clampedValue / normalizedMax) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={normalizedMax}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
        {children}
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
