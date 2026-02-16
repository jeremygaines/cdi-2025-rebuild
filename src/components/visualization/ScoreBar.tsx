interface ScoreBarProps {
  score: number;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  maxScore?: number;
}

export function ScoreBar({
  score,
  color,
  size = 'md',
  showValue = true,
  maxScore = 100
}: ScoreBarProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }[size];

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}
