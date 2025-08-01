"use client";
import { useState } from "react";
import type React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoSquare } from "@/components/logo-square";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand Name - Increased left padding */}
          <div className="flex items-center pl-10">
            <Link href="/" className="flex items-center">
              <div className="flex items-center gap-0.5">
                {/* Raffl text - moved closer to square */}
                <span className="font-bold text-xl text-tertiary">Raffl</span>
                {/* Pink square with white 3 - now using reusable component */}
                <LogoSquare />
              </div>
            </Link>
          </div>

          {/* Options Dropdown */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 hover:bg-accent"
                >
                  <span>Categories</span>
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
                    NGOs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/others" className="w-full">
                    Others
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

          {/* Centered Search Bar with Form */}
          <div className="flex-1 flex justify-center ">
            <div className="w-full max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Looking for something?"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-10 w-full border-primary/20 input-focus"
                />
              </form>
            </div>
          </div>

          {/*Rinbowkit Button*/}
          <div className="flex-1 flex justify-center">
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus="icon"
            />
          </div>

          {/* Create Raffle Button */}
          <div className="flex items-center pr-6">
            <Link href="/create">
              <Button className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Raffle</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
