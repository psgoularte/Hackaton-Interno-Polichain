import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent number formatting to prevent hydration errors
export function formatNumber(num: number): string {
  // Force consistent formatting regardless of locale
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

// Alternative simpler approach for integers
export function formatNumberSimple(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Format currency consistently
export function formatCurrency(num: number, currency = "ETH"): string {
  return `${formatNumber(num)} ${currency}`
}
