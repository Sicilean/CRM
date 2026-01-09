import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
}

export function CircularProgress({ 
  value, 
  size = 80, 
  strokeWidth = 8,
  className,
  showValue = true 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  // Colore progressivo basato sulla percentuale
  const getColor = (percentage: number) => {
    if (percentage < 30) return 'text-red-500'
    if (percentage < 60) return 'text-amber-500'
    if (percentage < 90) return 'text-blue-500'
    return 'text-green-500'
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-300", getColor(value))}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-lg font-bold", getColor(value))}>
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}

