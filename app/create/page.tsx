"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  Info,
  Check,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  parseEther,
  decodeEventLog,
  createPublicClient,
  http,
  getContract,
  Hex,
  keccak256,
  parseGwei,
  TransactionReceipt,
  PublicClient,
  toHex,
  decodeFunctionData,
  formatEther,
} from "viem";
import {
  AUTORAFFLEFACTORY_ADDRESS,
  AutoRaffleFactoryABI,
} from "../lib/contracts";
import { defineChain } from "viem";

export const hardhat = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

export const sepolia = defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ||
          "https://sepolia.infura.io/v3/sua_api_key",
      ],
    },
    public: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ||
          "https://sepolia.infura.io/v3/sua_api_key",
      ],
    },
  },
});

export default function CreateRafflePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: receipt, isPending } = useWaitForTransactionReceipt();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    prizeAmount: "",
    ticketPrice: "",
    targetAmount: "",
    endDate: "",
    walletAddress: "",
    image: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDivisibilityDialog, setShowDivisibilityDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    minimumTickets: 0,
    totalRaffleAmount: 0,
    maxTickets: 0,
    durationInSeconds: 0,
    platformFee: 0,
    creatorEarnings: 0,
  });

  useEffect(() => {
    const prizeAmount = Number.parseFloat(formData.prizeAmount) || 0;
    const ticketPrice = Number.parseFloat(formData.ticketPrice) || 0;
    const targetAmount = Number.parseFloat(formData.targetAmount) || 0;

    if (prizeAmount > 0 && ticketPrice > 0) {
      const minimumViableAmount = prizeAmount * 1.1;
      const minimumTickets = Math.ceil(minimumViableAmount / ticketPrice);
      const totalRaffleAmount = targetAmount + prizeAmount * 1.1;
      const maxTickets = Math.floor(totalRaffleAmount / ticketPrice);
      const platformFee = targetAmount * 0.1;
      const creatorEarnings = targetAmount - platformFee;

      setCalculatedValues({
        minimumTickets,
        totalRaffleAmount,
        maxTickets,
        durationInSeconds: 0,
        platformFee,
        creatorEarnings,
      });
    } else {
      setCalculatedValues({
        minimumTickets: 0,
        totalRaffleAmount: 0,
        maxTickets: 0,
        durationInSeconds: 0,
        platformFee: 0,
        creatorEarnings: 0,
      });
    }
  }, [formData.prizeAmount, formData.ticketPrice, formData.targetAmount]);

  useEffect(() => {
    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      const now = new Date();
      const durationInSeconds = Math.max(
        0,
        Math.floor((endDate.getTime() - now.getTime()) / 1000)
      );
      setCalculatedValues((prev) => ({ ...prev, durationInSeconds }));
    }
  }, [formData.endDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.prizeAmount)
      newErrors.prizeAmount = "Prize amount is required";
    if (!formData.ticketPrice)
      newErrors.ticketPrice = "Ticket price is required";
    if (!formData.targetAmount)
      newErrors.targetAmount = "Target amount is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.walletAddress.trim())
      newErrors.walletAddress = "Ethereum wallet address is required";

    if (
      formData.walletAddress &&
      !formData.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)
    ) {
      newErrors.walletAddress = "Please enter a valid Ethereum wallet address";
    }

    if (formData.prizeAmount && formData.ticketPrice && formData.targetAmount) {
      const prizeAmount = Number.parseFloat(formData.prizeAmount);
      const ticketPrice = Number.parseFloat(formData.ticketPrice);
      const targetAmount = Number.parseFloat(formData.targetAmount);
      const totalRaffleAmount = targetAmount + prizeAmount * 1.1;

      const remainder =
        ((totalRaffleAmount * 1000) % (ticketPrice * 1000)) / 1000;

      if (Math.abs(remainder) > 0.0001) {
        setShowDivisibilityDialog(true);
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmationDialog(true);
    }
  };

  const handleConfirmCreate = async () => {
    let txHash: Hex | null = null;
    let receipt: any = null;
    let checkInterval: NodeJS.Timeout | null = null;

    try {
      // 1. Configuração do cliente
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.NEXT_PUBLIC_RPC_URL),
      });

      // 2. Preparação dos parâmetros
      const prize = parseEther(Number(formData.prizeAmount).toFixed(18));
      const price = parseEther(formData.ticketPrice.toString());
      console.log("Valores enviados:", {
        prize: formatEther(prize), // Verifique no console
        price: formatEther(price),
      });
      const minTickets = BigInt(calculatedValues.minimumTickets);
      const duration = BigInt(calculatedValues.durationInSeconds);

      // 3. Envio da transação com gas otimizado
      txHash = (await writeContractAsync({
        address: AUTORAFFLEFACTORY_ADDRESS,
        abi: AutoRaffleFactoryABI,
        functionName: "createRaffle",
        args: [price, prize, duration, minTickets],
      })) as Hex;

      console.log("Price:", price, typeof price);
      console.log("Prize:", prize, typeof prize);
      console.log("Duration:", duration, typeof duration);
      console.log("MinTickets:", minTickets, typeof minTickets);
      console.log("Factory Address:", AUTORAFFLEFACTORY_ADDRESS);

      // 4. Feedback ao usuário
      setShowConfirmationDialog(false);
      const explorerLink = `http://localhost:3000/tx/${txHash}`;
      alert(
        `🔄 Transação enviada!\n\nAcompanhe no explorador:\n${explorerLink}`
      );

      // 5. Espera com timeout de 1 minutos
      const TIMEOUT = 60000; // 1 minutos
      const startTime = Date.now();

      while (Date.now() - startTime < TIMEOUT) {
        try {
          receipt = await publicClient.getTransactionReceipt({
            hash: txHash,
          });
          if (receipt) break;
          await new Promise((resolve) => setTimeout(resolve, 15000)); // Checa a cada 15s
        } catch (e) {
          console.log("Aguardando confirmação...", e);
        }
      }

      // 6. Verificação pós-timeout
      if (!receipt) {
        // Inicia monitoramento em background
        checkInterval = setInterval(async () => {
          try {
            const lateReceipt = await publicClient.getTransactionReceipt({
              hash: txHash as Hex,
            });
            if (lateReceipt) {
              clearInterval(checkInterval!);
              alert("✅ Transação confirmada posteriormente!");
              await processReceipt(lateReceipt, publicClient, txHash!);
            }
          } catch (e) {
            console.error("Erro ao verificar transação:", e);
          }
        }, 60000); // Verifica a cada 1 minuto

        throw new Error(`⌛ A transação está pendente. Você pode:
        1. Aguardar mais tempo
        2. Verificar manualmente: ${explorerLink}
        3. Tentar novamente com maior taxa de gás`);
      }

      // 7. Processamento do receipt
      await processReceipt(receipt, publicClient, txHash!);
    } catch (err) {
      console.error("Erro completo:", err);

      let errorMessage = `❌ ${
        err instanceof Error ? err.message : "Ocorreu um erro desconhecido"
      }`;
      if (txHash) {
        errorMessage += `\n\nHash da transação: ${txHash}`;
      }

      if (err instanceof Error && err.message.includes("revert")) {
        errorMessage +=
          "\n\nPossíveis causas:" +
          "\n- Parâmetros inválidos" +
          "\n- Saldo insuficiente" +
          "\n- Problemas no contrato";
      }

      alert(errorMessage);
    } finally {
      if (checkInterval) clearInterval(checkInterval);
    }
  };

  async function processReceipt(
    receipt: TransactionReceipt,
    publicClient: PublicClient,
    txHash: Hex
  ) {
    if (receipt.status === "reverted") {
      throw new Error("Transação revertida na blockchain");
    }

    // 1. Verifica se há logs na transação
    if (!receipt.logs || receipt.logs.length === 0) {
      console.error("Nenhum log encontrado na transação:", {
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        contractAddress: receipt.contractAddress,
      });
      throw new Error("Transação não emitiu nenhum evento");
    }

    // 2. Gera a assinatura do evento correta para sua estrutura
    const eventSignature = keccak256(
      toHex("RaffleCreated(address,address,uint256,uint256,uint256,uint256)")
    );
    const eventLog = receipt.logs.find(
      (log) => log.topics[0] === eventSignature
    );
    console.log("Expected event topic:", eventSignature);
    receipt.logs.forEach((log, i) => {
      console.log(`Log[${i}] topic0:`, log.topics[0]);
    });

    // 3. Procura pelo evento nos logs
    const creationEvent = receipt.logs.find(
      (log) =>
        log.topics[0] === eventSignature &&
        log.address.toLowerCase() === AUTORAFFLEFACTORY_ADDRESS.toLowerCase()
    );

    // 4. Debug detalhado caso não encontre
    if (!creationEvent) {
      console.error(
        "Eventos disponíveis na transação:",
        receipt.logs.map((log) => ({
          address: log.address,
          topics: log.topics,
          eventSignature: log.topics[0],
        }))
      );

      throw new Error(`
      Evento de criação não encontrado. Dicas:
      1. Verifique se o endereço do factory está correto: ${AUTORAFFLEFACTORY_ADDRESS}
      2. Confira se a assinatura do evento bate: ${eventSignature}
      3. Verifique se a transação foi enviada para o contrato certo
    `);
    }

    // 5. Decodificação do evento com sua estrutura específica
    let decodedEvent;
    try {
      decodedEvent = decodeEventLog({
        abi: AutoRaffleFactoryABI,
        data: creationEvent.data,
        topics: creationEvent.topics,
      });

      console.log("Evento decodificado:", decodedEvent);
    } catch (decodeError) {
      console.error("Falha ao decodificar evento:", {
        error: decodeError,
        data: creationEvent.data,
        topics: creationEvent.topics,
      });
      throw new Error("Formato do evento inesperado");
    }

    // 6. Extração dos parâmetros do seu evento específico
    const raffleAddress = decodedEvent.args.raffleAddress;
    const creator = decodedEvent.args.creator;
    const ticketPrice = decodedEvent.args.ticketPrice;
    const prizeValue = decodedEvent.args.prizeValue;

    if (!raffleAddress) {
      throw new Error(
        "Endereço da rifa não encontrado nos argumentos do evento"
      );
    }

    // 7. Verificação do contrato criado
    const contractCode = await publicClient.getBytecode({
      address: raffleAddress,
    });

    if (!contractCode || contractCode === "0x") {
      throw new Error(`
      Contrato da rifa encontrado (${raffleAddress}) 
      mas sem código implantado. Possível falha na criação.
    `);
    }

    // 8. Preparação dos dados para a API (ajustado para seu evento)
    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append("category", formData.category);
    formPayload.append("ticketPrice", ticketPrice.toString());
    formPayload.append("prizeValue", prizeValue.toString());
    formPayload.append("creator", creator);
    formPayload.append("raffleAddress", raffleAddress);
    formPayload.append("txHash", txHash);

    if (formData.image) {
      formPayload.append("image", formData.image);
    }

    // 9. Envio para a API
    const response = await fetch("/api/raffles", {
      method: "POST",
      body: formPayload,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao registrar na API");
    }

    return {
      raffleAddress,
      creator,
      ticketPrice,
      prizeValue,
    };
  }

  useEffect(() => {
    if (!receipt) return;

    console.log("📦 Receipt bruto da transação:", receipt);

    if (receipt.logs && receipt.logs.length > 0) {
      console.log("🔍 Logs brutos da transação:");
      receipt.logs.forEach((log, index) => {
        console.log(`🧾 Log ${index + 1}:`);
        console.log("Endereço do log:", log.address);
        console.log("Topics:", log.topics);
        console.log("Data:", log.data);
      });
    } else {
      console.warn("⚠️ Nenhum log retornado no receipt.");
    }
  }, [receipt]);

  async function debugTransaction(txHash: Hex) {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    // 1. Obter receipt e detalhes da transação
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    const tx = await publicClient.getTransaction({ hash: txHash });

    console.log("=== DIAGNÓSTICO DA TRANSAÇÃO ===");
    console.log("Para:", tx.to);

    console.log("Valor:", tx.value);
    console.log("Dados:", tx.input);
    console.log("Status:", receipt.status);
    console.log("Contrato criado:", receipt.contractAddress);
    console.log("Logs count:", receipt.logs?.length || 0);

    // 2. Verificar se foi para o contrato correto
    if (tx.to?.toLowerCase() !== AUTORAFFLEFACTORY_ADDRESS.toLowerCase()) {
      console.error("ERRO: Transação não enviada para o Factory!");
      return false;
    }

    // 3. Verificar chamada da função
    try {
      const decodedInput = decodeFunctionData({
        abi: AutoRaffleFactoryABI,
        data: tx.input,
      });
      console.log("Função chamada:", decodedInput.functionName);
      console.log("Argumentos:", decodedInput.args);
    } catch (e) {
      console.error("Não foi decodificar os dados da transação");
    }

    return true;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  //if(!address) {return(<div></div>);}

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create New Raffle
            </h1>
          </div>

          {/* Platform Fee Reminder */}
          <Card className="mb-6 border-tertiary/20 bg-tertiary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-tertiary" />
                <h3 className="font-semibold text-tertiary">
                  Platform Fee Notice
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Raffl3 will withhold 10% of the
                final amount earned by your Raffle for hosting services. This
                fee is automatically calculated and deducted from your target
                amount.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">
                Raffle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Raffle Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter raffle title"
                    className={
                      errors.title
                        ? "border-red-500 input-focus"
                        : "input-focus"
                    }
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your raffle and its purpose"
                    rows={4}
                    className={
                      errors.description
                        ? "border-red-500 textarea-focus"
                        : "textarea-focus"
                    }
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.category
                          ? "border-red-500 select-focus"
                          : "select-focus"
                      }
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studies">Studies</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="animals">Animals</SelectItem>
                      <SelectItem value="ngos">NGOs</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prizeAmount">Prize Amount (ETH) *</Label>
                    <Input
                      id="prizeAmount"
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={formData.prizeAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prizeAmount: e.target.value,
                        })
                      }
                      placeholder="10.0"
                      className={
                        errors.prizeAmount
                          ? "border-red-500 input-focus"
                          : "input-focus"
                      }
                    />
                    {errors.prizeAmount && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.prizeAmount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price (ETH) *</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.0000001"
                      min="0.000001"
                      value={formData.ticketPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ticketPrice: e.target.value,
                        })
                      }
                      placeholder="0.1"
                      className={
                        errors.ticketPrice
                          ? "border-red-500 input-focus"
                          : "input-focus"
                      }
                    />
                    {errors.ticketPrice && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.ticketPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (ETH) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAmount: e.target.value,
                      })
                    }
                    placeholder="10.0"
                    className={
                      errors.targetAmount
                        ? "border-red-500 input-focus"
                        : "input-focus"
                    }
                  />
                  {errors.targetAmount && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.targetAmount}
                    </p>
                  )}
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">
                    Creator's Ethereum Wallet Address *
                  </Label>
                  <Input
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        walletAddress: e.target.value,
                      })
                    }
                    placeholder="0x..."
                    className={
                      errors.walletAddress
                        ? "border-red-500 input-focus"
                        : "input-focus"
                    }
                  />
                  {errors.walletAddress && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.walletAddress}
                    </p>
                  )}
                </div>

                {/* Calculated Values Display */}
                {calculatedValues.totalRaffleAmount > 0 && (
                  <Card className="bg-accent/50 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-primary">
                          Calculated Values
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Minimum of Tickets:
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {calculatedValues.minimumTickets}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Total Raffle Amount:
                          </div>
                          <div className="text-lg font-bold text-secondary">
                            {calculatedValues.totalRaffleAmount.toFixed(3)} ETH
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Platform Fee (10%):
                          </div>
                          <div className="text-lg font-bold text-tertiary">
                            {calculatedValues.platformFee.toFixed(3)} ETH
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Your Earnings:
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {calculatedValues.creatorEarnings.toFixed(3)} ETH
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        * Minimum tickets = (Prize Amount × 1.1) ÷ Ticket Price
                        (rounded up)
                        <br />* Total Raffle Amount = Target Amount + (Prize
                        Amount × 1.1)
                        <br />* Platform Fee = Target Amount × 10%
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className={
                      errors.endDate
                        ? "border-red-500 input-focus"
                        : "input-focus"
                    }
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.endDate}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Raffle Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      {formData.image
                        ? formData.image.name
                        : "Click to upload or drag and drop (Optional - will show waving hands if not provided)"}
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-6"
                >
                  Create Raffle!
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Divisibility Error Dialog */}
      <Dialog
        open={showDivisibilityDialog}
        onOpenChange={setShowDivisibilityDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Invalid Ticket Price
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3">
                <div>
                  The <strong>Total Raffle Amount</strong> (
                  {calculatedValues.totalRaffleAmount.toFixed(3)} ETH) must be
                  divisible by the <strong>Ticket Price</strong> (
                  {formData.ticketPrice} ETH).
                </div>
                <div>Please adjust either the:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Target Amount</li>
                  <li>Prize Amount</li>
                  <li>Ticket Price</li>
                </ul>
                <div className="text-xs text-muted-foreground">
                  Total Raffle Amount = Target Amount + (Prize Amount × 1.1)
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowDivisibilityDialog(false)}
              variant="outline"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Check className="h-5 w-5" />
              Confirm Raffle Creation
            </DialogTitle>
            <DialogDescription>
              Please review your raffle details before creating:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Prize Amount:
                </span>
                <div className="font-bold text-primary">
                  {formData.prizeAmount} ETH
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Ticket Price:
                </span>
                <div className="font-bold text-secondary">
                  {formData.ticketPrice} ETH
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Total Raffle Amount:
                </span>
                <div className="font-bold text-primary">
                  {calculatedValues.totalRaffleAmount.toFixed(3)} ETH
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Maximum Tickets:
                </span>
                <div className="font-bold text-secondary">
                  {calculatedValues.maxTickets}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Platform Fee:
                </span>
                <div className="font-bold text-tertiary">
                  {calculatedValues.platformFee.toFixed(3)} ETH
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Your Earnings:
                </span>
                <div className="font-bold text-primary">
                  {calculatedValues.creatorEarnings.toFixed(3)} ETH
                </div>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">
                  Creator's Wallet:
                </span>
                <div className="font-mono text-xs break-all bg-accent p-2 rounded mt-1">
                  {formData.walletAddress}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  End Date:
                </span>
                <div className="font-bold text-primary">
                  {new Date(formData.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Duration:
                </span>
                <div className="font-bold text-secondary">
                  {formatDuration(calculatedValues.durationInSeconds)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCreate}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Confirm & Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
