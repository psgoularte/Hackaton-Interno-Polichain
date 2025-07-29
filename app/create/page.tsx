import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Create Prize Draw</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prize Draw Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is the create page where users will be able to set up their prize draws. The form and functionality
                will be implemented here.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
