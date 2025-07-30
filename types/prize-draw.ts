export interface Raffle {
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
  description?: string
  endDate?: string
  organizer?: string
  rules?: string[]
}

export type PrizeDraw = Raffle
