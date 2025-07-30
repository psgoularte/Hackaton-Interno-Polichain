import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/progress-bar"
import { ArrowLeft, Calendar, Users, Target, Clock } from "lucide-react"
import Link from "next/link"

// This would normally come from a database or API
const getPrizeDrawData = (id: string) => {
  const sampleData = {
    "1": {
      title: "Medical Research Fund for Cancer Treatment",
      image: "/placeholder.svg?height=400&width=600",
      prizeAmount: 50000,
      currentAmount: 35000,
      targetAmount: 50000,
      minimumValue: 30000,
      category: "Health",
      description:
        "This prize draw aims to fund groundbreaking cancer research that could lead to new treatment methods and potentially save thousands of lives. The research will focus on innovative immunotherapy approaches.",
      endDate: "2024-03-15",
      participants: 1250,
      organizer: "Medical Research Foundation",
      rules: [
        "Minimum contribution: $10",
        "Maximum entries per person: 100",
        "Winner will be selected randomly using blockchain verification",
        "Prize will be distributed within 48 hours of draw completion",
      ],
    },
  }

  return sampleData[id as keyof typeof sampleData] || sampleData["1"]
}

export default function PrizeDrawDetailPage({ params }: { params: { id: string } }) {
  const prizeData = getPrizeDrawData(params.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={prizeData.image || "/placeholder.svg"}
                  alt={prizeData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {prizeData.category}
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {prizeData.title}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">{prizeData.description}</p>
              </div>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Prize Draw Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prizeData.rules.map((rule, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Participation Info */}
            <div className="space-y-6">
              {/* Prize Amount */}
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">${prizeData.prizeAmount.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Prize Amount</div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Funding Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressBar
                    current={prizeData.currentAmount}
                    target={prizeData.targetAmount}
                    minimumValue={prizeData.minimumValue}
                    className="mb-4"
                  />
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">Participants</span>
                    </div>
                    <span className="font-semibold">{prizeData.participants.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">End Date</span>
                    </div>
                    <span className="font-semibold">{prizeData.endDate}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">Organizer</span>
                    </div>
                    <span className="font-semibold text-sm">{prizeData.organizer}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">Minimum Goal</span>
                    </div>
                    <span className="font-semibold">${prizeData.minimumValue.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Participate Button */}
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-6">
                Participate Now
              </Button>

              {/* Time Remaining */}
              <Card className="border-secondary/20">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-secondary mb-1">7 Days</div>
                  <div className="text-muted-foreground text-sm">Time Remaining</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
