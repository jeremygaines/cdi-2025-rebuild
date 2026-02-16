function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

interface ScoreBarProps {
  score: number;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  maxScore?: number;
  rank?: number;
  label?: string;
}

export function ScoreBar({
  score,
  color,
  size = 'md',
  showValue = true,
  maxScore = 100,
  rank,
  label
}: ScoreBarProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }[size];

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`relative group/bar flex-1 bg-gray-200 rounded-full overflow-visible ${heightClass}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
        {rank != null && (
          <RankTooltip rank={rank} color={color} label={label} />
        )}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function RankTooltip({ rank, color, label }: { rank: number; color: string; label?: string }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-20">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-center whitespace-nowrap">
        {label && (
          <div className="text-xs font-semibold mb-0.5" style={{ color }}>
            {label} rank
          </div>
        )}
        <div className="text-2xl font-bold text-gray-700 leading-tight">
          {rank}<span className="text-sm font-medium text-gray-400">{ordinalSuffix(rank)}</span>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-2.5 h-2.5 bg-white border-b border-r border-gray-200 rotate-45 -mt-1.5" />
      </div>
    </div>
  );
}
