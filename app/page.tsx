import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RaffleCard } from "@/components/raffle-card"
import { ArrowRight, Target, Shield, Share2, Sparkles, Clock, Wallet } from "lucide-react"
import { getFeaturedRaffles } from "@/lib/api"

export default async function HomePage() {
  const featuredRaffles = await getFeaturedRaffles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      {/* Hero Section */}
      <main className="w-full">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          {/* Hero Text - Left aligned but centered container */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto px-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-left">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                  A decentralized app that takes you closer to your financial goals
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mb-8 text-left">
                Join the future of fundraising with blockchain technology. Create, participate, and win in a transparent and
                secure environment.
              </p>
            </div>
          </div>

          {/* Showcase Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Featured Raffles
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
                {featuredRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id} {...raffle} />
                ))}
              </div>
            </div>
          </div>

          {/* How It Works - 2x3 Matrix Roadmap */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              How It Works
            </h2>

            {/* Desktop 2x3 Matrix */}
            <div className="hidden lg:block">
              <div className="relative max-w-4xl mx-auto">
                {/* Continuous Dashed Path - Zigzag Flow */}
                {/* Step 1 to Step 2 (horizontal right) */}
                <div className="absolute top-[16.67%] left-[25%] right-[25%] h-0.5 border-t-2 border-dashed border-primary/40"></div>

                {/* Step 2 to Step 4 (vertical down and horizontal left) */}
                <div className="absolute right-[25%] top-[16.67%] bottom-[50%] w-0.5 border-l-2 border-dashed border-primary/40"></div>
                <div className="absolute top-[50%] left-[25%] right-[25%] h-0.5 border-t-2 border-dashed border-primary/40"></div>

                {/* Step 3 to Step 5 (vertical down) */}
                <div className="absolute left-[25%] top-[50%] bottom-[16.67%] w-0.5 border-l-2 border-dashed border-primary/40"></div>

                {/* Step 5 to Step 6 (horizontal right) */}
                <div className="absolute bottom-[16.67%] left-[25%] right-[25%] h-0.5 border-t-2 border-dashed border-primary/40"></div>

                {/* 2x3 Grid */}
                <div className="grid grid-cols-2 gap-12 py-8">
                  {/* Row 1 */}
                  {/* Step 1 */}
                  <div className="text-center relative z-10">
                    <Card className="bg-white border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Target className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-sm font-bold text-primary mb-3">STEP 1</div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground">Set Your Goal</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          You've got a goal that you need resources for - whether it's funding a project, supporting a
                          cause, or raising money for any purpose.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center relative z-10">
                    <Card className="bg-white border-secondary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Shield className="h-12 w-12 text-secondary" />
                        </div>
                        <div className="text-sm font-bold text-secondary mb-3">STEP 2</div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground">Create Blockchain Raffle</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          We create a secure, transparent Raffle on the Blockchain to help you raise funds for whatever
                          you may need.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 2 */}
                  {/* Step 3 */}
                  <div className="text-center relative z-10">
                    <Card className="bg-white border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Share2 className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-sm font-bold text-primary mb-3">STEP 3</div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground">Share & Promote</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Engage friends and family through social media to make as many people as possible sign up to
                          your Raffle!
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Step 4 */}
                  <div className="text-center relative z-10">
                    <Card className="bg-white border-tertiary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-tertiary/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Sparkles className="h-12 w-12 text-tertiary" />
                        </div>
                        <div className="text-sm font-bold text-tertiary mb-3">STEP 4</div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground">Get Pink-Lit</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Your Raffle gets Pink-Lit by reaching economic viability - meaning enough participants have
                          joined to make it successful!
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 3 */}
                  {/* Step 5 */}
                  <div className="text-center relative z-10">
                    <Card className="bg-white border-secondary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Clock className="h-12 w-12 text-secondary" />
                        </div>
                        <div className="text-sm font-bold text-secondary mb-3">STEP 5</div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground">Automatic Winner Selection</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          When time's up or all tickets are sold, we automatically select a winner using blockchain
                          verification - no headaches!
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Step 6 */}
                  <div className="text-center relative z-10">
                    <Card className="bg-white border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Wallet className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-sm font-bold text-primary mb-3">STEP 6</div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground">Secure Payment</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Both your earnings and the winner's prize are automatically transferred through the Blockchain
                          to your respective wallets!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Roadmap */}
            <div className="lg:hidden">
              <div className="space-y-8">
                {[
                  {
                    icon: Target,
                    title: "STEP 1",
                    heading: "Set Your Goal",
                    desc: "You've got a goal that you need resources for - whether it's funding a project, supporting a cause, or raising money for any purpose.",
                    color: "primary",
                  },
                  {
                    icon: Shield,
                    title: "STEP 2",
                    heading: "Create Blockchain Raffle",
                    desc: "We create a secure, transparent Raffle on the Blockchain to help you raise funds for whatever you may need.",
                    color: "secondary",
                  },
                  {
                    icon: Share2,
                    title: "STEP 3",
                    heading: "Share & Promote",
                    desc: "Engage friends and family through social media to make as many people as possible sign up to your Raffle!",
                    color: "primary",
                  },
                  {
                    icon: Sparkles,
                    title: "STEP 4",
                    heading: "Get Pink-Lit",
                    desc: "Your Raffle gets Pink-Lit by reaching economic viability - meaning enough participants have joined to make it successful!",
                    color: "tertiary",
                  },
                  {
                    icon: Clock,
                    title: "STEP 5",
                    heading: "Automatic Winner Selection",
                    desc: "When time's up or all tickets are sold, we automatically select a winner using blockchain verification - no headaches!",
                    color: "secondary",
                  },
                  {
                    icon: Wallet,
                    title: "STEP 6",
                    heading: "Secure Payment",
                    desc: "Both your earnings and the winner's prize are automatically transferred through the Blockchain to your respective wallets!",
                    color: "primary",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r from-${step.color}/20 to-primary/20 rounded-full flex items-center justify-center`}
                      >
                        <step.icon className={`h-8 w-8 text-${step.color}`} />
                      </div>
                    </div>
                    <Card className="flex-1 border-primary/20 shadow-lg">
                      <CardContent className="p-6">
                        <div className="mb-3">
                          <div className={`text-sm font-bold text-${step.color} mb-2`}>{step.title}</div>
                          <h3 className="text-lg font-semibold text-foreground">{step.heading}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-16">
            <Link href="/create">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
              >
                I want to create a Raffle!
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
                  All raffle results are verifiable on the blockchain. No hidden algorithms or manipulation possible.
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

          {/* FAQ/Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-lg font-bold text-primary mb-3">What if raffles are not viable by the end date?</div>
              <div className="text-muted-foreground">
                Then the contract will give all the ticket money back to buyers, no problem!
              </div>
            </div>
            <div className="p-6">
              <div className="text-lg font-bold text-secondary mb-3">
                Will this project win the Polichain Internal Hackathon?
              </div>
              <div className="text-muted-foreground">Of course we will!</div>
            </div>
            <div className="p-6">
              <div className="text-lg font-bold text-primary mb-3">Do I have to create an account to take part?</div>
              <div className="text-muted-foreground">
                No, you just need to inform your Ethereum key, both for creating raffles and buying tickets
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
