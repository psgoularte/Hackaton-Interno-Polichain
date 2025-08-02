"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { getRaffleById } from "@/lib/api";
import { CONTRACTS } from "@/app/lib/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatUnits } from "viem";
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
import { ProgressBar } from "@/components/progress-bar";

export default function RaffleDetailPage() {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const [raffle, setRaffle] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");
  const [error, setError] = useState("");
  const [raffleEnded, setRaffleEnded] = useState(false);
  const [canRefund, setCanRefund] = useState(false);
  const [winner, setWinner] = useState("");

  const raffleABI = CONTRACTS.AutoRaffle.abi;

  const { writeContract: buyTicket, isPending: isBuying } = useWriteContract();
  const { writeContract: refundTickets, isPending: isRefunding } =
    useWriteContract();

  const { data: contractWinner } = useReadContract({
    address: raffle?.address as `0x${string}`,
    abi: raffleABI,
    functionName: "winner",
  });

  useEffect(() => {
    const load = async () => {
      const raffleId = Array.isArray(id) ? id[0] : id;
      if (!raffleId) return;

      try {
        const raffleData = await getRaffleById(raffleId);
        setRaffle(raffleData);

        const end = new Date(raffleData.endDate);
        const now = Date.now();
        setRaffleEnded(now > end.getTime());

        // Atualiza contagem regressiva
        const updateTimer = () => {
          const diff = end.getTime() - Date.now();
          if (diff <= 0) {
            setTimeLeft("Ended");
            return;
          }

          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar rifa");
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!raffleEnded || !raffle) return;

    const raised = Number(raffle.ticketPrice) * raffle.maxTickets;
    const goal = raffle.targetAmount * 1.1;
    setCanRefund(raised < goal);

    if (
      contractWinner &&
      contractWinner !== "0x0000000000000000000000000000000000000000"
    ) {
      setWinner(contractWinner);
    }
  }, [raffleEnded, raffle, contractWinner]);

  const handleBuy = () => {
    if (!raffle || !address || !isConnected) return;

    try {
      const total = parseEther(
        (Number(raffle.ticketPrice) * quantity).toString()
      );

      buyTicket({
        address: raffle.address as `0x${string}`,
        abi: raffleABI,
        functionName: "buyTicket",
        args: [BigInt(quantity)],
        value: total,
      });
    } catch (e) {
      console.error(e);
      setError("Erro na compra");
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) setQuantity(1);
    else if (raffle && value > raffle.maxTickets)
      setQuantity(raffle.maxTickets);
    else setQuantity(value);
  };

  const handleRefund = () => {
    if (!raffle || !address || !isConnected) return;

    refundTickets({
      address: raffle.address as `0x${string}`,
      abi: raffleABI,
      functionName: "claimRefund",
    });
  };

  if (!raffle) return <div className="p-4">Carregando...</div>;

  const totalCost = Number(raffle.ticketPrice) * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={raffle.image || "/placeholder.svg"}
                  alt={raffle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {raffle.category}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {timeLeft}
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {raffle.title}
                </h1>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">{raffle.description}</ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {raffle.prizeAmount} ETH
                  </div>
                  <div className="text-muted-foreground">
                    Total Prize Amount
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Funding Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressBar
                    participants={raffle.participants}
                    ticketPrice={raffle.ticketPrice}
                    targetAmount={raffle.targetAmount}
                    prizeAmount={raffle.prizeAmount}
                    className="mb-4"
                  />
                </CardContent>
              </Card>

              <Card className="border-tertiary/20">
                <CardHeader>
                  <CardTitle className="text-tertiary">
                    Purchase Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tertiary">
                      {raffle.ticketPrice} ETH
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
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={raffle.maxTickets}
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(parseInt(e.target.value))
                        }
                        className="text-center input-focus"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= raffle.maxTickets}
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

                  {error && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  )}

                  <Button
                    onClick={handleBuy}
                    className="w-full bg-tertiary hover:bg-tertiary/90 text-lg py-6"
                    disabled={raffleEnded || raffle.maxTickets === 0}
                  >
                    {raffleEnded
                      ? "Raffle Ended"
                      : raffle.maxTickets === 0
                      ? "Sold Out"
                      : "Purchase Tickets"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">
                        Tickets purchased
                      </span>
                    </div>
                    <span className="font-semibold">{raffle.participants}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary mr-2" />
                      <span className="text-muted-foreground">End Date</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(raffle.endDate).toLocaleDateString()}
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
                      {(raffle.prizeAmount * 1.1) / raffle.ticketPrice}
                    </span>
                  </div>
                </CardContent>
              </Card>

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
