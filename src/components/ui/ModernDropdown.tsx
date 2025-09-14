import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

interface ModernDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export default function ModernDropdown({
  trigger,
  items,
  align = "left",
  className,
}: ModernDropdownProps) {
  return (
    <Menu
      as="div"
      className={clsx("relative inline-block text-left", className)}
    >
      <div>
        <Menu.Button className="inline-flex items-center justify-center gap-x-2 px-4 py-2.5 rounded-lg bg-white text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-w-[120px]">
          {trigger}
          <ChevronDownIcon
            className="h-4 w-4 text-gray-500 ml-auto"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            "absolute z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none backdrop-blur-sm",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div className="py-2">
            {items.map((item) => (
              <Menu.Item key={item.id}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={clsx(
                      active ? "bg-gray-50 text-gray-900" : "text-gray-700",
                      "group flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition-all duration-150 hover:bg-gray-50",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{item.label}</span>
                    </span>
                    <ChevronDownIcon
                      className="h-4 w-4 text-gray-400 rotate-[-90deg]"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
