"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform hover:scale-105 duration-200"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="transcript-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Sparkle Glow Gradient */}
          <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Soft Glow Filter */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Purple Glow */}
        <circle cx="50" cy="50" r="40" fill="#7C3AED" opacity="0.25" filter="url(#logo-glow)" />

        {/* Outer Transcript Speech Bubble Container */}
        <path
          d="M 22 28 C 22 20, 28 14, 36 14 L 64 14 C 72 14, 78 20, 78 28 L 78 54 C 78 62, 72 68, 64 68 L 44 68 L 30 82 L 32 68 L 36 68 C 28 68, 22 62, 22 54 Z"
          fill="url(#transcript-grad-1)"
        />

        {/* Inner Dark Cutout for Contrast */}
        <path
          d="M 26 30 C 26 24, 30 20, 36 20 L 64 20 C 70 20, 74 24, 74 30 L 74 52 C 74 58, 70 62, 64 62 L 36 62 C 30 62, 26 58, 26 52 Z"
          fill="#0D1117"
        />

        {/* Audio Waveform Transcript Soundbars inside Speech Bubble */}
        {/* Bar 1 */}
        <rect x="34" y="38" width="4" height="12" rx="2" fill="url(#sparkle-grad)" />
        {/* Bar 2 */}
        <rect x="41" y="32" width="4" height="24" rx="2" fill="#A855F7" />
        {/* Bar 3 (Center Peak) */}
        <rect x="48" y="26" width="4" height="34" rx="2" fill="#E0E7FF" filter="url(#logo-glow)" />
        {/* Bar 4 */}
        <rect x="55" y="32" width="4" height="24" rx="2" fill="#A855F7" />
        {/* Bar 5 */}
        <rect x="62" y="38" width="4" height="12" rx="2" fill="url(#sparkle-grad)" />

        {/* Top-Right AI Sparkle Star */}
        <path
          d="M 78 14 Q 78 22 86 22 Q 78 22 78 30 Q 78 22 70 22 Q 78 22 78 14 Z"
          fill="#38BDF8"
          filter="url(#logo-glow)"
        />
        <path
          d="M 20 66 Q 20 70 24 70 Q 20 70 20 74 Q 20 70 16 70 Q 20 70 20 66 Z"
          fill="#F472B6"
          filter="url(#logo-glow)"
        />
      </svg>
    </div>
  );
}
