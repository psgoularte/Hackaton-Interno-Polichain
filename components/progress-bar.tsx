import { cn } from "@/lib/utils"

interface ProgressBarProps {
  current: number
  target: number
  className?: string
}

export function ProgressBar({ current, target, className }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>${current.toLocaleString()}</span>
        <span>${target.toLocaleString()}</span>
      </div>
      <div className="w-full bg-accent rounded-full h-3">
        <div
          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-center text-sm text-muted-foreground mt-1">{percentage.toFixed(1)}% funded</div>
    </div>
  )
}
