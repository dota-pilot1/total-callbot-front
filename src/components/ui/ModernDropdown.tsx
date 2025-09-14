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
        <Menu.Button className="inline-flex items-center gap-x-1 px-2.5 py-1.5 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400">
          {trigger}
          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
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
            "absolute z-10 mt-1 w-44 rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none",
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
                      active ? "bg-gray-100" : "",
                      "block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    {item.label}
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
