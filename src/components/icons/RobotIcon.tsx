interface RobotIconProps {
  className?: string;
}

export function RobotIcon({ className = "h-6 w-6" }: RobotIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 머리 - 네모네모 */}
      <rect x="7" y="6" width="10" height="9" rx="1" />
      {/* 안테나 - 귀여운 점 */}
      <circle cx="9.5" cy="4" r="0.5" />
      <circle cx="14.5" cy="4" r="0.5" />
      <line x1="9.5" y1="4.5" x2="9.5" y2="6" />
      <line x1="14.5" y1="4.5" x2="14.5" y2="6" />
      {/* 눈 - 네모 눈 */}
      <rect x="9" y="9" width="1.5" height="1.5" rx="0.2" />
      <rect x="13.5" y="9" width="1.5" height="1.5" rx="0.2" />
      {/* 입 - 네모 입 */}
      <rect x="11" y="12" width="2" height="0.8" rx="0.2" />
      {/* 몸통 - 네모 몸통 */}
      <rect x="8.5" y="15" width="7" height="5" rx="0.8" />
      {/* 팔 - 네모 팔 */}
      <rect x="6" y="17" width="1.5" height="0.8" rx="0.2" />
      <rect x="16.5" y="17" width="1.5" height="0.8" rx="0.2" />
    </svg>
  );
}
