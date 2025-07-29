import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "./progress-bar"

interface PrizeDrawCardProps {
  id: string
  title: string
  image: string
  prizeAmount: number
  currentAmount: number
  targetAmount: number
  category: string
}

export function PrizeDrawCard({
  id,
  title,
  image,
  prizeAmount,
  currentAmount,
  targetAmount,
  category,
}: PrizeDrawCardProps) {
  return (
    <Link href={`/prize-draw/${id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
        <CardContent className="p-0">
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
              {category}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="mb-4">
              <div className="text-2xl font-bold text-primary mb-1">${prizeAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Prize Amount</div>
            </div>
            <ProgressBar current={currentAmount} target={targetAmount} className="mb-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
