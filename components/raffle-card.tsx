"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "./progress-bar"
import { Users, Ticket, Clock } from "lucide-react"
import { useState, useEffect } from "react"

interface RaffleCardProps {
  id: string
  title: string
  image: string
  prizeAmount: number
  currentAmount: number
  targetAmount: number
  minimumValue: number
  ticketPrice: number
  participants: number
  category: string
  endDate?: string
}

export function RaffleCard({
  id,
  title,
  image,
  prizeAmount,
  currentAmount,
  targetAmount,
  minimumValue,
  ticketPrice,
  participants,
  category,
  endDate = "2024-04-15T23:59:59",
}: RaffleCardProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDateTime = new Date(endDate)
      const now = new Date()
      const difference = endDateTime.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft(`${minutes}m`)
        }
      } else {
        setTimeLeft("Ended")
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [endDate])

  const displayImage = image || "/placeholder.svg?height=200&width=300&text=👋"

  return (
    <Link href={`/raffle/${id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-tertiary/40">
        <CardContent className="p-0">
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img
              src={displayImage || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 bg-primary group-hover:bg-tertiary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300">
              {category}
            </div>
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.toLocaleString()}
            </div>
            {/* Timer overlay */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLeft}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-tertiary transition-colors duration-300">
              {title}
            </h3>

            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-2xl font-bold text-primary group-hover:text-tertiary mb-1 transition-colors duration-300">
                  {prizeAmount.toLocaleString()} ETH
                </div>
                <div className="text-sm text-muted-foreground">Prize Amount</div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-semibold text-secondary group-hover:text-tertiary transition-colors duration-300">
                  <Ticket className="h-4 w-4" />
                  {ticketPrice} ETH
                </div>
                <div className="text-sm text-muted-foreground">Per Ticket</div>
              </div>
            </div>

            <ProgressBar current={currentAmount} target={targetAmount} minimumValue={minimumValue} className="mb-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
