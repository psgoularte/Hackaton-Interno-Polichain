import { PrizeDrawCard } from "./prize-draw-card"
import type { PrizeDraw } from "@/types/prize-draw"

interface PrizeDrawGridProps {
  prizeDraws: PrizeDraw[]
  title?: string
  showTitle?: boolean
}

export function PrizeDrawGrid({ prizeDraws, title, showTitle = true }: PrizeDrawGridProps) {
  if (prizeDraws.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No prize draws found in this category.</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && title && (
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h1>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizeDraws.map((draw) => (
          <PrizeDrawCard key={draw.id} {...draw} />
        ))}
      </div>
    </div>
  )
}
