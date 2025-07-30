import { RaffleCard } from "./raffle-card"
import type { Raffle } from "@/types/prize-draw"

interface RaffleGridProps {
  raffles: Raffle[]
  title?: string
  showTitle?: boolean
}

export function RaffleGrid({ raffles, title, showTitle = true }: RaffleGridProps) {
  if (raffles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No raffles found in this category.</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && title && (
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-left mb-12 text-tertiary">{title}</h1>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raffles.map((raffle) => (
          <RaffleCard key={raffle.id} {...raffle} />
        ))}
      </div>
    </div>
  )
}
