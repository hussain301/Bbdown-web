

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function ProgressBar({ progress, size = 'md', animated = true }: ProgressBarProps) {
  const heightClass = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }[size];

  const percentage = Math.max(0, Math.min(100, progress * 100));

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heightClass} relative`}>
      <div 
        className={`h-full rounded-full transition-all duration-300 ease-out flex items-center justify-center
          bg-gradient-to-r from-[#667eea] to-[#fb7299]`}
        style={{ width: `${percentage}%` }}
      >
        {animated && percentage > 0 && percentage < 100 && (
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHBhdGggZD0iTTAgNDBsNDAtNDBIMjBMMCAyMHYyMHptNDAgMEwwIDBoMjBMMDQgMjB2MjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIgZmlsbC1ydWxlPSJldmVub2RkIi8+Cjwvc3ZnPg==')] animate-[slide_2s_linear_infinite]" />
        )}
      </div>
    </div>
  );
}
