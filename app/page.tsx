import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PrizeDrawCard } from "@/components/prize-draw-card"
import { ArrowRight, Target, Users, Trophy, Shield } from "lucide-react"

// Sample data for prize draws
const samplePrizeDraws = [
  {
    id: "1",
    title: "Medical Research Fund for Cancer Treatment",
    image: "/placeholder.svg?height=200&width=300",
    prizeAmount: 50000,
    currentAmount: 35000,
    targetAmount: 50000,
    category: "Health",
  },
  {
    id: "2",
    title: "Scholarship Fund for Underprivileged Students",
    image: "/placeholder.svg?height=200&width=300",
    prizeAmount: 25000,
    currentAmount: 18500,
    targetAmount: 25000,
    category: "Studies",
  },
  {
    id: "3",
    title: "Wildlife Conservation Project",
    image: "/placeholder.svg?height=200&width=300",
    prizeAmount: 75000,
    currentAmount: 42000,
    targetAmount: 75000,
    category: "Animals",
  },
  {
    id: "4",
    title: "Clean Water Initiative for Rural Communities",
    image: "/placeholder.svg?height=200&width=300",
    prizeAmount: 100000,
    currentAmount: 67000,
    targetAmount: 100000,
    category: "NGO's",
  },
  {
    id: "5",
    title: "Emergency Disaster Relief Fund",
    image: "/placeholder.svg?height=200&width=300",
    prizeAmount: 200000,
    currentAmount: 185000,
    targetAmount: 200000,
    category: "NGO's",
  },
  {
    id: "6",
    title: "Educational Technology for Schools",
    image: "/placeholder.svg?height=200&width=300",
    prizeAmount: 30000,
    currentAmount: 28500,
    targetAmount: 30000,
    category: "Studies",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      {/* Hero Section */}
      <main className="w-full">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          {/* Hero Text - Centered */}
          <div className="mb-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                  A decentralized app that takes you closer to your financial goals
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Join the future of prize draws with blockchain technology. Create, participate, and win in a transparent
                and secure environment.
              </p>
            </div>
          </div>

          {/* Showcase Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Featured Prize Draws
              </h2>
              <Link href="/category/most-popular">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Scrollable Grid */}
            <div className="overflow-x-auto pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-full">
                {samplePrizeDraws.map((draw) => (
                  <PrizeDrawCard key={draw.id} {...draw} />
                ))}
              </div>
            </div>
          </div>

          {/* Roadmap Image */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              How It Works
            </h2>
            <Card className="max-w-4xl mx-auto border-primary/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Step 1 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Create</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up your prize draw with custom rules and rewards
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>

                  {/* Step 2 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="font-semibold mb-2">2. Participate</h3>
                    <p className="text-sm text-muted-foreground">Users join your draw using cryptocurrency</p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>

                  {/* Step 3 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">3. Win</h3>
                    <p className="text-sm text-muted-foreground">Smart contracts automatically distribute prizes</p>
                  </div>
                </div>

                {/* Blockchain Security */}
                <div className="mt-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Secured by Blockchain
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    All transactions are transparent, immutable, and verified on the blockchain. No central authority
                    can manipulate results or withhold prizes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-16">
            <Link href="/create">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
              >
                I want to create a prize draw
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-primary">Transparent</h3>
                <p className="text-muted-foreground">
                  All draw results are verifiable on the blockchain. No hidden algorithms or manipulation possible.
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-secondary">Decentralized</h3>
                <p className="text-muted-foreground">
                  No single point of failure. Smart contracts handle everything automatically and securely.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-primary">Global Access</h3>
                <p className="text-muted-foreground">
                  Anyone, anywhere can participate. No geographical restrictions or traditional banking required.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-muted-foreground">Total Prizes Distributed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">15K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Prize Draws Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
