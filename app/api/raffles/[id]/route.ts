// app/api/raffles/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { fetchRaffleDataFromContract } from "@/lib/api"; // ajuste o path se necessário

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const dbRaffle = await prisma.raffle.findUnique({
      where: { id },
    });

    if (!dbRaffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    const contractData = await fetchRaffleDataFromContract(dbRaffle.address);

    return NextResponse.json({
      id: dbRaffle.id.toString(),
      title: dbRaffle.title,
      image: dbRaffle.coverImageUrl || "/placeholder.svg",
      prizeAmount: contractData.prizeAmount || 0,
      currentAmount: contractData.currentAmount || 0,
      targetAmount: contractData.targetAmount || 0,
      minimumValue: contractData.minimumValue || 0,
      ticketPrice: contractData.ticketPrice || 0,
      participants: contractData.participants || 0,
      category: dbRaffle.category || "general",
      description: dbRaffle.content || "",
      endDate:
        contractData.endDate ||
        new Date(Date.now() + (dbRaffle.duration ?? 0) * 1000).toISOString(),
      organizer: dbRaffle.wallet,
      address: dbRaffle.address,
    });
  } catch (error) {
    console.error("Error fetching raffle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
