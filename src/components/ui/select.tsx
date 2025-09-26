import * as React from "react";

import { Listbox } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { cn } from "../../lib/utils";

type BivariantStringCallback = {
  bivarianceHack(value: string): void;
}["bivarianceHack"];

interface SelectContextValue {
  value: string;
  onValueChange: BivariantStringCallback;
  options: Map<string, React.ReactNode>;
  registerOption: (value: string, label: React.ReactNode) => void;
  disabled: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

interface SelectProps {
  value: string;
  onValueChange: BivariantStringCallback;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Select = ({
  value,
  onValueChange,
  disabled = false,
  className,
  children,
}: SelectProps) => {
  const [options, setOptions] = React.useState<Map<string, React.ReactNode>>(
    () => new Map(),
  );

  const registerOption = React.useCallback(
    (optionValue: string, label: React.ReactNode) => {
      setOptions((prev) => {
        const next = new Map(prev);
        next.set(optionValue, label);
        return next;
      });
    },
    [],
  );

  const contextValue = React.useMemo(
    () => ({ value, onValueChange, options, registerOption, disabled }),
    [value, onValueChange, options, registerOption, disabled],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <Listbox value={value} onChange={onValueChange} disabled={disabled}>
        <div className={cn("relative", className)}>{children}</div>
      </Listbox>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { disabled } = useSelectContext();

    return (
      <Listbox.Button
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <span className="flex-1 text-left">{children}</span>
        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" aria-hidden="true" />
      </Listbox.Button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: React.ReactNode;
  className?: string;
}

const SelectValue = ({ placeholder = "Select an option", className }: SelectValueProps) => {
  const { value, options } = useSelectContext();
  const label = options.get(value);
  const display = label ?? (value ? value : placeholder);

  return (
    <span
      className={cn(
        "block truncate",
        !label && !value && "text-muted-foreground",
        className,
      )}
    >
      {display}
    </span>
  );
};
SelectValue.displayName = "SelectValue";

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, align = "start", children, ...props }, ref) => (
    <Listbox.Options
      ref={ref}
      className={cn(
        "absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md focus:outline-none",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      {children}
    </Listbox.Options>
  ),
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Listbox.Option>, "value" | "children"> {
  value: string;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLLIElement, SelectItemProps>(
  ({ value, children, className, ...props }, ref) => {
    const { registerOption } = useSelectContext();

    React.useEffect(() => {
      registerOption(value, children);
    }, [registerOption, value, children]);

    return (
      <Listbox.Option
        ref={ref}
        value={value}
        className={({
          active,
        }: {
          active: boolean;
          disabled: boolean;
          selected: boolean;
        }) =>
          cn(
            "relative flex cursor-pointer select-none items-center py-2 px-3 text-sm outline-none",
            active && "bg-accent text-accent-foreground",
            className,
          )
        }
        {...props}
      >
        {({ selected }) => (
          <span className={cn("flex-1", selected ? "font-medium" : "font-normal")}>
            {children}
          </span>
        )}
      </Listbox.Option>
    );
  },
);
SelectItem.displayName = "SelectItem";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
