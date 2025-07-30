import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
  variant?: "default" | "favicon" | "compact"
}

const sizeClasses = {
  xs: {
    container: "h-4 w-4",
    square: "h-4 w-4 rounded-sm",
    text: "text-xs",
    number: "text-xs",
    gap: "gap-0.5",
  },
  sm: {
    container: "h-5 w-5",
    square: "h-5 w-5 rounded",
    text: "text-sm",
    number: "text-sm",
    gap: "gap-1",
  },
  md: {
    container: "h-6 w-6",
    square: "h-6 w-6 rounded",
    text: "text-base",
    number: "text-base",
    gap: "gap-1",
  },
  lg: {
    container: "h-8 w-8",
    square: "h-8 w-8 rounded-md",
    text: "text-lg",
    number: "text-lg",
    gap: "gap-1.5",
  },
  xl: {
    container: "h-10 w-10",
    square: "h-10 w-10 rounded-lg",
    text: "text-xl",
    number: "text-xl",
    gap: "gap-2",
  },
}

export function Logo({ size = "md", className, showText = true, variant = "default" }: LogoProps) {
  const sizes = sizeClasses[size]

  // Favicon variant - just the square with 3
  if (variant === "favicon") {
    return (
      <div className={cn("flex items-center justify-center", sizes.container, className)}>
        <div className={cn("bg-tertiary flex items-center justify-center", sizes.square)}>
          <span className={cn("text-white font-bold leading-none", sizes.number)}>3</span>
        </div>
      </div>
    )
  }

  // Compact variant - smaller text, tighter spacing
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center", sizes.gap, className)}>
        <span className={cn("font-bold text-tertiary", sizes.text)}>Raffl</span>
        <div className={cn("bg-tertiary flex items-center justify-center", sizes.square)}>
          <span className={cn("text-white font-bold leading-none", sizes.number)}>3</span>
        </div>
      </div>
    )
  }

  // Default variant - full logo with text
  return (
    <div className={cn("flex items-center", sizes.gap, className)}>
      {showText && <span className={cn("font-bold text-tertiary", sizes.text)}>Raffl</span>}
      <div className={cn("bg-tertiary flex items-center justify-center", sizes.square)}>
        <span className={cn("text-white font-bold leading-none", sizes.number)}>3</span>
      </div>
    </div>
  )
}

// SVG Logo Component for better scalability and favicon generation
export function LogoSVG({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background square with rounded corners */}
      <rect width="32" height="32" rx="6" fill="#ec4899" />

      {/* Number 3 - optimized for small sizes */}
      <path
        d="M12 8h8c1.1 0 2 .9 2 2v2c0 .6-.4 1-1 1h-1c.6 0 1 .4 1 1v2c0 1.1-.9 2-2 2h-8v-2h8v-2h-4v-2h4v-2h-8V8z"
        fill="white"
      />
    </svg>
  )
}

// Favicon generator component
export function FaviconLogo() {
  return <LogoSVG size={32} />
}
