"use client"
import { useState, useEffect, Suspense } from "react"
import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { RaffleGrid } from "@/components/raffle-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, Filter, SortAsc, SortDesc } from "lucide-react"
import Link from "next/link"
import { searchRaffles } from "@/lib/api"
import type { Raffle } from "@/types/prize-draw"

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<Raffle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [sortBy, setSortBy] = useState<"relevance" | "popularity" | "prize" | "ending">("relevance")

  // Perform search when component mounts with query parameter
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const results = await searchRaffles(query.trim())
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
      // Update URL with new search query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const sortResults = (results: Raffle[], sortType: string) => {
    const sorted = [...results]
    switch (sortType) {
      case "popularity":
        return sorted.sort((a, b) => b.participants - a.participants)
      case "prize":
        return sorted.sort((a, b) => b.prizeAmount - a.prizeAmount)
      case "ending":
        return sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      default:
        return sorted // Keep original relevance order
    }
  }

  const sortedResults = sortResults(searchResults, sortBy)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Dynamic Search Title */}
          <div className="mb-8">
            {initialQuery ? (
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  "{initialQuery}"
                </h1>
                <p className="text-xl text-muted-foreground">
                  {isLoading
                    ? "Searching for raffles..."
                    : hasSearched
                      ? `${searchResults.length} raffle${searchResults.length === 1 ? "" : "s"} found`
                      : "Enter a search term to find raffles"}
                </p>
              </div>
            ) : (
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Search Raffles
                </h1>
                <p className="text-xl text-muted-foreground">Find the perfect raffle for your interests</p>
              </div>
            )}

            {/* Enhanced Search Form */}
            <Card className="max-w-3xl mx-auto border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="search"
                      placeholder="Search for raffles by title, description, category, or organizer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-32 py-4 text-lg border-primary/20 input-focus rounded-lg"
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Search Results Section */}
          {hasSearched && (
            <div>
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <div className="text-lg text-muted-foreground">Searching for raffles...</div>
                </div>
              ) : (
                <>
                  {/* Results Header with Sorting */}
                  {searchResults.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Search Results</h2>
                        <p className="text-muted-foreground">
                          Showing {searchResults.length} raffle{searchResults.length === 1 ? "" : "s"} for "
                          {initialQuery || searchQuery}"
                        </p>
                      </div>

                      {/* Sort Options */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <div className="flex gap-1">
                          {[
                            { key: "relevance", label: "Relevance", icon: Filter },
                            { key: "popularity", label: "Popular", icon: SortDesc },
                            { key: "prize", label: "Prize", icon: SortDesc },
                            { key: "ending", label: "Ending Soon", icon: SortAsc },
                          ].map(({ key, label, icon: Icon }) => (
                            <Button
                              key={key}
                              variant={sortBy === key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSortBy(key as any)}
                              className={
                                sortBy === key
                                  ? "bg-gradient-to-r from-primary to-secondary"
                                  : "border-primary/20 hover:border-primary/40"
                              }
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raffle Cards Grid */}
                  {searchResults.length > 0 ? (
                    <div className="mb-12">
                      <RaffleGrid raffles={sortedResults} showTitle={false} />
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="max-w-md mx-auto">
                        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-foreground mb-4">No raffles found</h3>
                        <p className="text-muted-foreground mb-8">
                          We couldn't find any raffles matching "{initialQuery || searchQuery}". Try different keywords
                          or explore our categories below.
                        </p>

                        {/* Category Suggestions */}
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">Browse by category:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {[
                              { href: "/category/studies", label: "Studies", color: "bg-blue-500" },
                              { href: "/category/health", label: "Health", color: "bg-red-500" },
                              { href: "/category/animals", label: "Animals", color: "bg-green-500" },
                              { href: "/category/ngos", label: "NGOs", color: "bg-purple-500" },
                              { href: "/category/others", label: "Others", color: "bg-orange-500" },
                            ].map(({ href, label, color }) => (
                              <Link key={href} href={href}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-primary/20 hover:border-primary/40 bg-transparent"
                                >
                                  <div className={`w-2 h-2 rounded-full ${color} mr-2`}></div>
                                  {label}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Statistics */}
                  {searchResults.length > 0 && (
                    <Card className="border-primary/20 bg-accent/30">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-semibold text-center mb-6 text-foreground">Search Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                          <div>
                            <div className="text-3xl font-bold text-primary mb-2">{searchResults.length}</div>
                            <div className="text-sm text-muted-foreground">Matching Raffles</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-secondary mb-2">
                              {searchResults.reduce((sum, raffle) => sum + raffle.participants, 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Participants</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-tertiary mb-2">
                              {searchResults.reduce((sum, raffle) => sum + raffle.prizeAmount, 0).toFixed(1)} ETH
                            </div>
                            <div className="text-sm text-muted-foreground">Total Prize Pool</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-primary mb-2">
                              {Math.round(
                                searchResults.reduce((sum, raffle) => sum + raffle.prizeAmount, 0) /
                                  searchResults.length,
                              ) || 0}{" "}
                              ETH
                            </div>
                            <div className="text-sm text-muted-foreground">Average Prize</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* Initial State - No Search Performed */}
          {!hasSearched && !initialQuery && (
            <div className="text-center py-16">
              <div className="max-w-lg mx-auto">
                <Search className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">Discover Amazing Raffles</h3>
                <p className="text-muted-foreground mb-8">
                  Use the search bar above to find raffles by title, description, category, or organizer name. Or
                  explore our popular categories below.
                </p>

                {/* Popular Categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { href: "/category/most-popular", label: "Most Popular", icon: "🔥" },
                    { href: "/category/about-to-end", label: "Ending Soon", icon: "⏰" },
                    { href: "/category/studies", label: "Education", icon: "📚" },
                    { href: "/category/health", label: "Health", icon: "🏥" },
                    { href: "/category/animals", label: "Animals", icon: "🐾" },
                    { href: "/category/ngos", label: "NGOs", icon: "🤝" },
                  ].map(({ href, label, icon }) => (
                    <Link key={href} href={href}>
                      <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{icon}</div>
                          <div className="text-sm font-medium text-foreground">{label}</div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-lg text-muted-foreground">Loading search...</div>
            </div>
          </main>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
