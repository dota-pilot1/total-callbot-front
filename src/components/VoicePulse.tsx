
interface VoicePulseProps {
  active: boolean;
  size?: number; // px
}

// Simple concentric pulse animation ("태양 파동")
export default function VoicePulse({ active, size = 56 }: VoicePulseProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Base circle */}
      <div
        className={`absolute inset-0 rounded-full ${active ? 'bg-red-500' : 'bg-gray-300'}`}
        style={{ boxShadow: active ? '0 0 0 4px rgba(239,68,68,0.25)' : undefined }}
      />
      {/* Pulses */}
      <span
        className={`absolute inset-0 rounded-full border ${active ? 'border-red-400' : 'border-transparent'} ${
          active ? 'animate-ping' : ''
        }`}
      />
      <span
        className={`absolute inset-0 rounded-full border ${active ? 'border-red-300' : 'border-transparent'} ${
          active ? 'animate-ping' : ''
        }`}
        style={{ animationDelay: '150ms' }}
      />
      {/* Mic glyph */}
      <svg
        className="absolute inset-0 m-auto text-white"
        width={Math.floor(size * 0.45)}
        height={Math.floor(size * 0.45)}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
      </svg>
    </div>
  );
}

