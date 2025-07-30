type Raffle = {
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
  description: string
  endDate: string
  organizer: string
}

// Simulated backend data - in real app this would come from your API
const backendData: Record<string, Raffle[]> = {
  studies: [
    {
      id: "study-1",
      title: "Scholarship Fund for Underprivileged Students",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 5,
      currentAmount: 3.7,
      targetAmount: 5,
      minimumValue: 4,
      ticketPrice: 0.1,
      participants: 3700,
      category: "Studies",
      description: "Supporting education for those who need it most",
      endDate: "2024-04-20",
      organizer: "Education Foundation",
    },
    {
      id: "study-2",
      title: "Educational Technology for Schools",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 6,
      currentAmount: 5.7,
      targetAmount: 6,
      minimumValue: 5,
      ticketPrice: 0.2,
      participants: 2850,
      category: "Studies",
      description: "Bringing modern technology to classrooms",
      endDate: "2024-04-15",
      organizer: "Tech Education Initiative",
    },
    {
      id: "study-3",
      title: "Research Grant for Climate Studies",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 15,
      currentAmount: 9,
      targetAmount: 15,
      minimumValue: 10,
      ticketPrice: 0.3,
      participants: 3000,
      category: "Studies",
      description: "Advancing climate change research",
      endDate: "2024-05-01",
      organizer: "Climate Research Institute",
    },
  ],
  health: [
    {
      id: "health-1",
      title: "Medical Research Fund for Cancer Treatment",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 10,
      currentAmount: 7,
      targetAmount: 10,
      minimumValue: 6,
      ticketPrice: 0.2,
      participants: 1750,
      category: "Health",
      description: "Funding breakthrough cancer research",
      endDate: "2024-03-15",
      organizer: "Medical Research Foundation",
    },
    {
      id: "health-2",
      title: "Mental Health Support Program",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 8,
      currentAmount: 6.4,
      targetAmount: 8,
      minimumValue: 5,
      ticketPrice: 0.16,
      participants: 4000,
      category: "Health",
      description: "Supporting mental health initiatives",
      endDate: "2024-04-10",
      organizer: "Mental Health Alliance",
    },
  ],
  animals: [
    {
      id: "animal-1",
      title: "Wildlife Conservation Project",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 15,
      currentAmount: 8.4,
      targetAmount: 15,
      minimumValue: 8,
      ticketPrice: 0.24,
      participants: 3500,
      category: "Animals",
      description: "Protecting endangered species",
      endDate: "2024-04-25",
      organizer: "Wildlife Protection Society",
    },
    {
      id: "animal-2",
      title: "Animal Shelter Support Fund",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 7,
      currentAmount: 5.6,
      targetAmount: 7,
      minimumValue: 4,
      ticketPrice: 0.14,
      participants: 4000,
      category: "Animals",
      description: "Supporting local animal shelters",
      endDate: "2024-03-30",
      organizer: "Animal Welfare Organization",
    },
  ],
  ngos: [
    {
      id: "ngo-1",
      title: "Clean Water Initiative for Rural Communities",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 20,
      currentAmount: 13.4,
      targetAmount: 20,
      minimumValue: 12,
      ticketPrice: 0.5,
      participants: 2680,
      category: "NGO's",
      description: "Bringing clean water to underserved communities",
      endDate: "2024-05-15",
      organizer: "Water for All Foundation",
    },
    {
      id: "ngo-2",
      title: "Emergency Disaster Relief Fund",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 40,
      currentAmount: 37,
      targetAmount: 40,
      minimumValue: 30,
      ticketPrice: 1,
      participants: 3700,
      category: "NGO's",
      description: "Rapid response for natural disasters",
      endDate: "2024-03-20",
      organizer: "Global Relief Network",
    },
  ],
  others: [
    {
      id: "other-1",
      title: "Community Garden Project",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 12,
      currentAmount: 8.5,
      targetAmount: 12,
      minimumValue: 9,
      ticketPrice: 0.25,
      participants: 3400,
      category: "Others",
      description: "Creating green spaces for local communities",
      endDate: "2024-04-18",
      organizer: "Green Community Initiative",
    },
    {
      id: "other-2",
      title: "Local Arts Festival Support",
      image: "/placeholder.svg?height=200&width=300",
      prizeAmount: 8,
      currentAmount: 6.2,
      targetAmount: 8,
      minimumValue: 5.5,
      ticketPrice: 0.15,
      participants: 4133,
      category: "Others",
      description: "Supporting local artists and cultural events",
      endDate: "2024-04-12",
      organizer: "Arts Community Collective",
    },
  ],
}

export async function getRafflesByCategory(category: string): Promise<Raffle[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const categoryKey = category.toLowerCase().replace("'s", "s")
  const draws = backendData[categoryKey] || []

  // Sort by popularity (participants count) in descending order
  return draws.sort((a, b) => b.participants - a.participants)
}

export async function getMostPopularRaffles(): Promise<Raffle[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Get all raffles from all categories
  const allDraws = Object.values(backendData).flat()

  // Sort by popularity and return top 6
  return allDraws.sort((a, b) => b.participants - a.participants).slice(0, 6)
}

export async function getAboutToEndRaffles(): Promise<Raffle[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Get all raffles and sort by end date (closest first)
  const allDraws = Object.values(backendData).flat()

  return allDraws.sort((a, b) => new Date(a.endDate || "").getTime() - new Date(b.endDate || "").getTime()).slice(0, 6)
}

export async function getFeaturedRaffles(): Promise<Raffle[]> {
  // For homepage, return a mix of popular draws from different categories
  return getMostPopularRaffles()
}

// Enhanced search function with better filtering
export async function searchRaffles(query: string): Promise<Raffle[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Get all raffles from all categories
  const allDraws = Object.values(backendData).flat()

  // Convert query to lowercase for case-insensitive search
  const searchTerm = query.toLowerCase().trim()

  // Filter raffles based on search criteria
  const filteredRaffles = allDraws.filter((raffle) => {
    return (
      raffle.title.toLowerCase().includes(searchTerm) ||
      raffle.description.toLowerCase().includes(searchTerm) ||
      raffle.category.toLowerCase().includes(searchTerm) ||
      raffle.organizer.toLowerCase().includes(searchTerm)
    )
  })

  // Sort by relevance (title matches first, then by popularity)
  return filteredRaffles.sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(searchTerm)
    const bTitle = b.title.toLowerCase().includes(searchTerm)

    if (aTitle && !bTitle) return -1
    if (!aTitle && bTitle) return 1

    // If both or neither match title, sort by popularity
    return b.participants - a.participants
  })
}
