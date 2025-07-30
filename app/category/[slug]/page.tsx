import { Navbar } from "@/components/navbar"
import { RaffleGrid } from "@/components/raffle-grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getRafflesByCategory, getMostPopularRaffles, getAboutToEndRaffles } from "@/lib/api"

const categoryNames: Record<string, string> = {
  studies: "Studies",
  health: "Health",
  animals: "Animals",
  ngos: "NGO's",
  "most-popular": "Most Popular",
  "about-to-end": "About to End",
}

async function getCategoryData(slug: string) {
  switch (slug) {
    case "most-popular":
      return await getMostPopularRaffles()
    case "about-to-end":
      return await getAboutToEndRaffles()
    default:
      return await getRafflesByCategory(slug)
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const raffles = await getCategoryData(params.slug)
  const categoryName = categoryNames[params.slug] || params.slug

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Category Content */}
        <div className="max-w-7xl mx-auto">
          <RaffleGrid raffles={raffles} title={categoryName} />
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{raffles.length}</div>
              <div className="text-muted-foreground">Active Raffles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">
                {raffles.reduce((sum, raffle) => sum + raffle.participants, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                ${raffles.reduce((sum, raffle) => sum + raffle.prizeAmount, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Prize Pool</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
