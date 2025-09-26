import * as React from "react";

import { cn } from "../../lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number[];
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, className, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
    const currentValue = value?.[0] ?? min;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = Number(event.target.value);
      onValueChange?.([nextValue]);
    };

    return (
      <input
        ref={ref}
        type="range"
        value={currentValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

Slider.displayName = "Slider";

export { Slider };
