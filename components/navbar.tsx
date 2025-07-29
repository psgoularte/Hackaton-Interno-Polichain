"use client"
import Link from "next/link"
import { Search, ChevronDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PlaceHolder
              </span>
            </Link>
          </div>

          {/* Options Dropdown */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 hover:bg-accent">
                  <span>Options</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>
                  <Link href="/category/studies" className="w-full">
                    Studies
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/health" className="w-full">
                    Health
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/animals" className="w-full">
                    Animals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/ngos" className="w-full">
                    {"NGO's"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/most-popular" className="w-full">
                    Most Popular
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/about-to-end" className="w-full">
                    About to End
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search prize draws..."
                  className="pl-10 w-full border-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Create Prize Draw Button */}
          <div className="flex items-center">
            <Link href="/create">
              <Button className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Prize Draw</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
