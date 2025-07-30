import { cn } from "@/lib/utils"

interface LogoSquareProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  xs: {
    square: "h-4 w-4 rounded-sm",
    number: "text-xs",
    padding: "pl-0.5",
  },
  sm: {
    square: "h-5 w-5 rounded",
    number: "text-sm",
    padding: "pl-0.5",
  },
  md: {
    square: "h-6 w-6 rounded",
    number: "text-base",
    padding: "pl-0.5",
  },
  lg: {
    square: "h-8 w-8 rounded-md",
    number: "text-lg",
    padding: "pl-1",
  },
  xl: {
    square: "h-10 w-10 rounded-lg",
    number: "text-xl",
    padding: "pl-1",
  },
}

export function LogoSquare({ size = "md", className }: LogoSquareProps) {
  const sizes = sizeClasses[size]

  return (
    <div className={cn("bg-tertiary flex items-center justify-start", sizes.square, sizes.padding, className)}>
      <span className={cn("text-white font-bold leading-none", sizes.number)}>3</span>
    </div>
  )
}

// SVG version for better scalability and favicon use
export function LogoSquareSVG({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pink square background with rounded corners */}
      <rect width="32" height="32" rx="6" fill="#ec4899" />

      {/* White number 3 - positioned to the left like the original */}
      <text x="4" y="22" fill="white" fontSize="20" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">
        3
      </text>
    </svg>
  )
}
