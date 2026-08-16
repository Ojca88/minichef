interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ size = 20, color }: IconProps) {
  return (
    <svg {...base(size)} stroke={color ?? 'currentColor'}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function PlanIcon({ size = 20, color }: IconProps) {
  return (
    <svg {...base(size)} stroke={color ?? 'currentColor'}>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 9h18" />
    </svg>
  );
}

export function PlanIconFull({ size = 22, color }: IconProps) {
  return (
    <svg {...base(size)} stroke={color ?? 'var(--color-accent)'}>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function BookIcon({ size = 20, color }: IconProps) {
  return (
    <svg {...base(size)} stroke={color ?? 'currentColor'}>
      <path d="M4 5a2 2 0 012-2h6v18H6a2 2 0 01-2-2V5z" />
      <path d="M12 3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6" />
    </svg>
  );
}

export function ChartIcon({ size = 20, color }: IconProps) {
  return (
    <svg {...base(size)} stroke={color ?? 'currentColor'}>
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-6" />
    </svg>
  );
}

export function CartIcon({ size = 20, color }: IconProps) {
  return (
    <svg {...base(size)} stroke={color ?? 'currentColor'}>
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-1.6L20 8H6" />
    </svg>
  );
}

export function PinIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function RefreshIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M21 12a9 9 0 11-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function CheckIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function ThumbUpIcon({ size = 16, flipped = false }: IconProps & { flipped?: boolean }) {
  return (
    <svg {...base(size)} style={flipped ? { transform: 'scaleY(-1)' } : undefined}>
      <path d="M7 22V11l5-9 1 1v6h6a2 2 0 012 2l-2 8a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
    </svg>
  );
}

export function AlertIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 2L2 20h20L12 2z" />
      <path d="M12 9v5" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function SpeakerIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
      <path d="M16 8a5 5 0 010 8" />
    </svg>
  );
}
