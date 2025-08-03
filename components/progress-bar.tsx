"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";

interface ProgressBarProps {
  participants: number;
  ticketPrice: bigint | string;
  targetAmount: bigint | string;
  prizeAmount: bigint | string;
  className?: string;
}

export function ProgressBar({
  participants,
  ticketPrice,
  targetAmount,
  prizeAmount,
  className,
}: ProgressBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoiza cálculo dos valores para evitar recalcular desnecessariamente
  const {
    current,
    targetAmountEth,
    prizeAmountEth,
    percentage,
    isViable,
    remainingEth,
    debugInfo,
  } = useMemo(() => {
    try {
      // Converte todos os valores para BigInt, lança erro se inválido
      const ticketPriceBigInt = BigInt(ticketPrice);
      const targetAmountBigInt = BigInt(targetAmount);
      const prizeAmountBigInt = BigInt(prizeAmount);

      // Converte de wei para ETH (número)
      const ticketPriceEth = Number(formatUnits(ticketPriceBigInt, 18));
      const targetEth = Number(formatUnits(targetAmountBigInt, 18));
      const prizeEth = Number(formatUnits(prizeAmountBigInt, 18));

      // Calcula total arrecadado = participantes * preço do ticket
      const currentValue = participants * ticketPriceEth;

      // Percentual: current / target, com limite máximo 100%
      const rawPercentage =
        targetEth > 0 ? (currentValue / targetEth) * 100 : 0;

      // Barra mínima 1% para mostrar qualquer progresso > 0
      const pct =
        currentValue > 0 ? Math.min(Math.max(rawPercentage, 1), 100) : 0;

      // Condição de "viável"
      const viable = currentValue >= prizeEth;

      // Quanto falta para viabilizar
      const remaining = Math.max(prizeEth - currentValue, 0);

      // Debug para conferir valores no console ou UI
      const debug = {
        participants,
        ticketPrice,
        targetAmount,
        prizeAmount,
        ticketPriceEth,
        targetEth,
        prizeEth,
        currentValue,
        rawPercentage,
        pct,
      };

      return {
        current: currentValue,
        targetAmountEth: targetEth,
        prizeAmountEth: prizeEth,
        percentage: pct,
        isViable: viable,
        remainingEth: remaining,
        debugInfo: debug,
      };
    } catch (err) {
      console.error("Error in ProgressBar calculation:", err);
      return {
        current: 0,
        targetAmountEth: 0,
        prizeAmountEth: 0,
        percentage: 0,
        isViable: false,
        remainingEth: 0,
        debugInfo: null,
      };
    }
  }, [participants, ticketPrice, targetAmount, prizeAmount]);

  // Formatação numérica com até 5 casas decimais
  const formatNumber = (num: number) =>
    num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 5,
    });

  if (!mounted) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Loading...</span>
          <span>Loading...</span>
        </div>
        <div className="w-full bg-accent rounded-full h-3">
          <div className="h-3 rounded-full bg-muted" style={{ width: "0%" }} />
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-muted-foreground">Loading...</div>
          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Valores para debug visual */}
      <pre className="mb-2 text-xs text-red-500 select-none">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{formatNumber(current)} ETH</span>
        <span>{formatNumber(targetAmountEth)} ETH</span>
      </div>
      <div className="w-full bg-accent rounded-full h-3">
        <div
          className={cn(
            "h-3 rounded-full transition-all duration-300 ease-in-out",
            isViable
              ? "bg-gradient-to-r from-tertiary to-tertiary/80"
              : "bg-gradient-to-r from-primary to-secondary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-sm text-muted-foreground">
          {percentage.toFixed(1)}% funded
        </div>
        <div
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            isViable
              ? "bg-tertiary/10 text-tertiary"
              : "bg-primary/10 text-primary"
          )}
        >
          {isViable ? "Viable" : `Need ${formatNumber(remainingEth)} ETH`}
        </div>
      </div>
    </div>
  );
}
