"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/progress-bar";
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Clock,
  Minus,
  Plus,
  AlertCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { CONTRACTS } from "@/app/lib/contracts";
import { parseEther } from "viem";

const { address, isConnected } = useAccount();
const raffleABI = CONTRACTS.AutoRaffle.abi;

// This would normally come from a database or API
const getRaffleData = (id: string) => {
  const sampleData = {
    "1": {
      title: "Medical Research Fund for Cancer Treatment",
      image: "/placeholder.svg?height=400&width=600",
      prizeAmount: 10,
      currentAmount: 7,
      targetAmount: 10,
      minimumTickets: 55, // Calculated as (10 * 1.1) / 0.2 = 55
      ticketPrice: 0.2,
      participants: 1750,
      category: "Health",
      description:
        "This raffle aims to fund groundbreaking cancer research that could lead to new treatment methods and potentially save thousands of lives. The research will focus on innovative immunotherapy approaches.",
      endDate: "2024-03-15T23:59:59",
      rules: [
        "Minimum purchase: 1 ticket",
        "Winner will be selected randomly using blockchain verification",
        "Prize will be distributed within 48 hours of raffle completion",
        "Only whole tickets can be purchased",
        "If the Raffle is not viable by the Raffle's end, all the money will be refunded",
      ],
    },
  };

  return sampleData[id as keyof typeof sampleData] || sampleData["1"];
};

export default function RaffleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const raffleData = getRaffleData(params.id);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [buyerWallet, setBuyerWallet] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const maxTickets = Math.floor(
    (raffleData.targetAmount - raffleData.currentAmount) /
      raffleData.ticketPrice
  );
  const totalCost = ticketQuantity * raffleData.ticketPrice;

  // Timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date(raffleData.endDate);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft("Ended");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [raffleData.endDate]);

  const {
    writeContract: deleteRaffle,
    data: deleteData,
    isPending: isDeleting,
  } = useWriteContract();

  const handleDelete = () => {
    deleteRaffle({
      address: params.id as `0x${string}`,
      abi: raffleABI, // ABI do contrato AutoRaffle
      functionName: "cancelRaffle", // supondo essa função
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    setError("");
    if (newQuantity < 1) {
      setTicketQuantity(1);
    } else if (newQuantity > maxTickets) {
      setTicketQuantity(maxTickets);
      setError(`Maximum ${maxTickets} tickets available`);
    } else {
      setTicketQuantity(newQuantity);
    }
  };

  const { writeContract: buyTicket, isPending } = useWriteContract();

  const handleBuyTicket = () => {
    if (!isConnected || !address) return;

    buyTicket({
      address: params.id as `0x${string}`,
      abi: raffleABI,
      functionName: "buyTicket",
      args: [BigInt(ticketQuantity)], // ✅ aqui convertemos
      value: parseEther(totalCost.toString()), // ✅ valor em ETH, também como BigInt
    });
  };

  const { data: raffleOwner } = useReadContract({
    address: params.id as `0x${string}`,
    abi: raffleABI,
    functionName: "owner",
  });

  const isOwner = address?.toLowerCase() === raffleOwner?.toLowerCase();

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
                  src={raffleData.image || "/placeholder.svg"}
                  alt={raffleData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {raffleData.category}
                </div>
                {/* Timer overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {timeLeft}
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {raffleData.title}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {raffleData.description}
                </p>
              </div>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Raffle Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {raffleData.rules.map((rule, index) => (
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
                  <div className="text-4xl font-bold text-primary mb-2">
                    {raffleData.prizeAmount} ETH
                  </div>
                  <div className="text-muted-foreground">
                    Total Prize Amount
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Funding Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressBar
                    current={raffleData.currentAmount}
                    target={raffleData.targetAmount}
                    minimumValue={
                      raffleData.minimumTickets * raffleData.ticketPrice
                    }
                    className="mb-4"
                  />
                </CardContent>
              </Card>

              {/* Ticket Purchase */}
              <Card className="border-tertiary/20">
                <CardHeader>
                  <CardTitle className="text-tertiary">
                    Purchase Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tertiary">
                      {raffleData.ticketPrice} ETH
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Per Ticket
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Tickets</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(ticketQuantity - 1)}
                        disabled={ticketQuantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={maxTickets}
                        value={ticketQuantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                        className="text-center input-focus"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(ticketQuantity + 1)}
                        disabled={ticketQuantity >= maxTickets}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-lg font-semibold">Total Cost</div>
                    <div className="text-2xl font-bold text-tertiary">
                      {totalCost.toFixed(3)} ETH
                    </div>
                  </div>

                  {/* Buyer's Wallet Address */}
                  <div className="space-y-2">
                    <Label htmlFor="buyerWallet">
                      Your Ethereum Wallet Address
                    </Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="buyerWallet"
                        value={buyerWallet}
                        onChange={(e) => setBuyerWallet(e.target.value)}
                        placeholder="0x..."
                        className="pl-10 input-focus"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  )}

                  <Button
                    onClick={handleBuyTicket}
                    className="w-full bg-tertiary hover:bg-tertiary/90 text-lg py-6"
                    disabled={maxTickets === 0 || timeLeft === "Ended"}
                  >
                    {timeLeft === "Ended"
                      ? "Raffle Ended"
                      : maxTickets === 0
                      ? "Sold Out"
                      : "Purchase Tickets"}
                  </Button>
                </CardContent>
              </Card>

              {isOwner && (
                <Button variant="destructive" onClick={handleDelete}>
                  Deletar Rifa
                </Button>
              )}

              {/* Stats */}
              <Card className="border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">
                        Participants
                      </span>
                    </div>
                    <span className="font-semibold">
                      {raffleData.participants.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">End Date</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(raffleData.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">
                        Minimum of Tickets
                      </span>
                    </div>
                    <span className="font-semibold">
                      {raffleData.minimumTickets}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Time Remaining */}
              <Card className="border-secondary/20">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {timeLeft}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Time Remaining
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
