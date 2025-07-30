import { cn } from "@/lib/utils"

interface ProgressBarProps {
  current: number
  target: number
  minimumValue: number
  className?: string
}

export function ProgressBar({ current, target, minimumValue, className }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isViable = current >= minimumValue

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{current.toLocaleString()} ETH</span>
        <span>{target.toLocaleString()} ETH</span>
      </div>
      <div className="w-full bg-accent rounded-full h-3">
        <div
          className={cn(
            "h-3 rounded-full transition-all duration-300 ease-in-out",
            isViable ? "bg-gradient-to-r from-tertiary to-tertiary/80" : "bg-gradient-to-r from-primary to-secondary",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-center text-sm text-muted-foreground">{percentage.toFixed(1)}% funded</div>
        <div
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            isViable ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary",
          )}
        >
          {isViable ? "Viable" : `Need ${(minimumValue - current).toFixed(3)} ETH`}
        </div>
      </div>
    </div>
  )
}
