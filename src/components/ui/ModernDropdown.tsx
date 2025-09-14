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
        <Menu.Button className="inline-flex w-9 h-9 justify-center items-center gap-x-1 rounded-lg bg-white text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          {trigger}
          <ChevronDownIcon
            className="-mr-1 h-4 w-4 text-gray-500"
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
            "absolute z-10 mt-2 w-44 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none backdrop-blur-sm",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item key={item.id}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={clsx(
                      active
                        ? "bg-gray-50 text-gray-900 border-l-2 border-indigo-500"
                        : "text-gray-700",
                      "group flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-25",
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={clsx(
                          active ? "text-indigo-600" : "text-gray-500",
                          "h-4 w-4 transition-colors duration-150",
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex-1 text-left">{item.label}</span>
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
