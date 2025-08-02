// src/lib/api.ts
import { AutoRaffleABI } from "@/app/lib/contracts";
import { PrismaClient } from "@prisma/client";
import {
  getTransactionReceipt,
  callContract,
  timestampToDate,
  weiToEth,
  ContractABI,
  TransactionResponse,
} from "@/app/services/blockchain";
import { AutoRaffleFactoryABI } from "@/app/lib/contracts";

const prisma = new PrismaClient();

interface Raffle {
  id: string;
  title: string;
  image: string;
  prizeAmount: number;
  currentAmount: number;
  targetAmount: number;
  minimumValue: number;
  ticketPrice: number;
  participants: number;
  category: string;
  description: string;
  endDate: string;
  organizer: string;
  address: string;
}

interface RaffleCreationData {
  title: string;
  image?: string;
  walletAddress: string;
  prizeAmount: number;
  targetAmount: number;
  ticketPrice: number;
  category: string;
  description: string;
  endDate: string;
}

async function fetchRaffleDataFromContract(
  contractAddress: string
): Promise<Partial<Raffle>> {
  try {
    const [ticketPrice, prizeValue, totalTicketsSold, endTime] =
      await Promise.all([
        callContract<string>({
          address: contractAddress,
          abi: AutoRaffleABI as unknown as any[], // importe o ABI correto, não o da factory
          functionName: "ticketPrice",
        }),
        callContract<string>({
          address: contractAddress,
          abi: AutoRaffleABI as unknown as any[],
          functionName: "prizeValue",
        }),
        callContract<string>({
          address: contractAddress,
          abi: AutoRaffleABI as unknown as any[],
          functionName: "totalTicketsSold",
        }),
        callContract<string>({
          address: contractAddress,
          abi: AutoRaffleABI as unknown as any[],
          functionName: "endTime",
        }),
      ]);

    // Converte e retorna um objeto parcial do tipo Raffle
    return {
      ticketPrice: weiToEth(ticketPrice),
      prizeAmount: weiToEth(prizeValue),
      participants: Number(totalTicketsSold),
      endDate: timestampToDate(endTime),
    };
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return {}; // Garanta o retorno mesmo em erro
  }
}

export async function createRaffle(
  raffleData: RaffleCreationData
): Promise<Raffle> {
  try {
    // 1. Chamar a função createRaffle no contrato factory existente
    const tx = await callContract<TransactionResponse>({
      address: AutoRaffleFactoryABI as unknown as string,
      abi: AutoRaffleFactoryABI as unknown as ContractABI,
      functionName: "createRaffle",
      args: [
        weiToEth(raffleData.ticketPrice.toString()),
        weiToEth(raffleData.prizeAmount.toString()),
        Math.floor(
          (new Date(raffleData.endDate).getTime() - Date.now()) / 1000
        ),
        Math.floor(raffleData.targetAmount / raffleData.ticketPrice),
      ],
    });

    // 2. Obter o endereço do novo contrato de rifa
    if (!tx.wait) {
      throw new Error("Transaction response missing wait method");
    }

    const receipt = await getTransactionReceipt(tx.hash);
    const raffleAddress = receipt.logs[0].address;

    if (!raffleAddress) {
      throw new Error("Failed to get raffle contract address from transaction");
    }

    // 3. Depois criamos o registro no banco de dados
    const formData = new FormData();
    formData.append("title", raffleData.title);
    formData.append("content", raffleData.description);
    formData.append("category", raffleData.category);
    formData.append("wallet", raffleData.walletAddress);
    formData.append("address", raffleAddress);
    if (raffleData.image) {
      formData.append("file", raffleData.image);
    }
    formData.append("ticketPrice", raffleData.ticketPrice.toString());
    formData.append("prizeValue", raffleData.prizeAmount.toString());
    formData.append(
      "duration",
      Math.floor(
        (new Date(raffleData.endDate).getTime() - Date.now()) / 1000
      ).toString()
    );
    formData.append(
      "maxTickets",
      Math.floor(raffleData.targetAmount / raffleData.ticketPrice).toString()
    );

    const response = await fetch("/api/raffles", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create raffle");
    }

    const dbRaffle = await response.json();

    return {
      id: dbRaffle.id.toString(),
      title: dbRaffle.title,
      image: dbRaffle.coverImageUrl || "/placeholder.svg",
      category: dbRaffle.category || "general",
      description: dbRaffle.content || "",
      organizer: dbRaffle.wallet,
      address: dbRaffle.address,
      minimumValue: raffleData.prizeAmount,
      ticketPrice: raffleData.ticketPrice,
      prizeAmount: raffleData.prizeAmount,
      targetAmount: raffleData.targetAmount,
      endDate: raffleData.endDate,
      currentAmount: 0, // Inicialmente zero
      participants: 0, // Inicialmente zero
    };
  } catch (error) {
    console.error("Error creating raffle:", error);
    throw error;
  }
}

// Função para buscar uma rifa específica por ID
export async function getRaffleById(id: string): Promise<Raffle> {
  try {
    // Primeiro busca no banco de dados
    const dbRaffle = await prisma.raffle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dbRaffle) {
      throw new Error("Raffle not found");
    }

    // Depois busca dados do contrato
    const contractData = await fetchRaffleDataFromContract(dbRaffle.address);

    return {
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
        new Date(Date.now() + dbRaffle.duration * 1000).toISOString(),
      organizer: dbRaffle.wallet,
      address: dbRaffle.address,
    };
  } catch (error) {
    console.error(`Error fetching raffle ${id}:`, error);
    throw error;
  }
}

async function getRafflesWithContractData() {
  const dbRaffles = await prisma.raffle.findMany();

  return Promise.all(
    dbRaffles.map(async (dbRaffle) => {
      const contractData = await fetchRaffleDataFromContract(dbRaffle.address);

      return {
        id: dbRaffle.id.toString(),
        title: dbRaffle.title,
        image: dbRaffle.coverImageUrl || "/placeholder.svg",
        category: dbRaffle.category || "general",
        description: dbRaffle.content || "",
        organizer: dbRaffle.wallet,
        address: dbRaffle.address,
        ...contractData,
      } as Raffle;
    })
  );
}

export async function getFeaturedRaffles(): Promise<Raffle[]> {
  const allRaffles = await getRafflesWithContractData();
  return allRaffles.sort((a, b) => b.participants - a.participants).slice(0, 6);
}

export async function getMostPopularRaffles(): Promise<Raffle[]> {
  const allRaffles = await getRafflesWithContractData();
  return allRaffles
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 12);
}

export async function getAboutToEndRaffles(): Promise<Raffle[]> {
  const allRaffles = await getRafflesWithContractData();
  return allRaffles
    .sort((a, b) => {
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      return dateA - dateB;
    })
    .slice(0, 12);
}

export async function getRafflesByCategory(
  category: string
): Promise<Raffle[]> {
  const allRaffles = await getRafflesWithContractData();
  return allRaffles
    .filter(
      (raffle) => raffle.category.toLowerCase() === category.toLowerCase()
    )
    .sort((a, b) => b.participants - a.participants);
}

export async function searchRaffles(query: string): Promise<Raffle[]> {
  const allRaffles = await getRafflesWithContractData();
  const searchTerm = query.toLowerCase().trim();

  return allRaffles
    .filter((raffle) => {
      return (
        raffle.title.toLowerCase().includes(searchTerm) ||
        raffle.description.toLowerCase().includes(searchTerm) ||
        raffle.category.toLowerCase().includes(searchTerm) ||
        raffle.organizer.toLowerCase().includes(searchTerm) ||
        raffle.address.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchTerm);
      const bTitle = b.title.toLowerCase().includes(searchTerm);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return b.participants - a.participants;
    });
}

export async function updateRaffle(
  id: string,
  data: Partial<Raffle>
): Promise<Raffle> {
  try {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("content", data.description);
    if (data.category) formData.append("category", data.category);
    if (data.organizer) formData.append("wallet", data.organizer);
    if (data.address) formData.append("address", data.address);
    if (data.ticketPrice)
      formData.append("ticketPrice", data.ticketPrice.toString());
    if (data.prizeAmount)
      formData.append("prizeValue", data.prizeAmount.toString());
    if (data.endDate) {
      const duration = Math.floor(
        (new Date(data.endDate).getTime() - Date.now()) / 1000
      );
      formData.append("duration", duration.toString());
    }

    const response = await fetch(`/api/raffles?id=${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update raffle");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating raffle ${id}:`, error);
    throw error;
  }
}

export async function deleteRaffle(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/raffles?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete raffle");
    }
  } catch (error) {
    console.error(`Error deleting raffle ${id}:`, error);
    throw error;
  }
}
