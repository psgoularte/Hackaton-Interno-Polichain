"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ProgressBarProps {
  current: number
  target: number
  minimumValue: number
  className?: string
}

export function ProgressBar({ current, target, minimumValue, className }: ProgressBarProps) {
  const [mounted, setMounted] = useState(false)

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const percentage = Math.min((current / target) * 100, 100)
  const isViable = current >= minimumValue

  // Format numbers consistently for both server and client
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    })
  }

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Loading...</span>
          <span>Loading...</span>
        </div>
        <div className="w-full bg-accent rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: "0%" }} />
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-center text-sm text-muted-foreground">Loading...</div>
          <div className="text-xs px-2 py-1 rounded-full font-medium bg-primary/10 text-primary">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{formatNumber(current)} ETH</span>
        <span>{formatNumber(target)} ETH</span>
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
          {isViable ? "Viable" : `Need ${formatNumber(minimumValue - current)} ETH`}
        </div>
      </div>
    </div>
  )
}
