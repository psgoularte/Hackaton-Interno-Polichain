"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface RefundButtonProps {
  raffleAddress: `0x${string}`;
  raffleEndTimestamp: number;
  getRaffleState: () => Promise<string>;
  finalizeRaffle: () => Promise<string>;
  claimRefund: () => Promise<string>;
}

export function RefundButton({
  raffleAddress,
  raffleEndTimestamp,
  getRaffleState,
  finalizeRaffle,
  claimRefund,
}: RefundButtonProps) {
  const [raffleState, setRaffleState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isEnded = Date.now() / 1000 > raffleEndTimestamp;

  useEffect(() => {
    const fetchState = async () => {
      try {
        const state = await getRaffleState();
        setRaffleState(state);
      } catch (e) {
        setError("Erro ao obter estado da rifa");
      }
    };
    fetchState();
  }, [getRaffleState]);

  const handleClick = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (raffleState === "Active" || raffleState === "Valid") {
        if (isEnded) {
          await finalizeRaffle();
          await claimRefund();
          setSuccessMsg("Rifa finalizada e reembolso solicitado com sucesso.");
        } else {
          setError("A rifa ainda não terminou.");
        }
      } else if (raffleState === "Refunded") {
        await claimRefund();
        setSuccessMsg("Reembolso solicitado com sucesso.");
      } else {
        setError("Estado da rifa não permite reembolso.");
      }
    } catch (e) {
      setError("Erro ao processar a operação.");
    } finally {
      setLoading(false);
    }
  };

  if (
    !(
      (isEnded && (raffleState === "Active" || raffleState === "Valid")) ||
      raffleState === "Refunded"
    )
  ) {
    return null;
  }

  return (
    <div className="mt-4 text-center">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}
      <Button onClick={handleClick} disabled={loading} variant="destructive">
        {loading ? "Processando..." : "Solicitar Reembolso / Finalizar"}
      </Button>
    </div>
  );
}
