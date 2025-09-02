import { useMutation } from "@tanstack/react-query";
import RenderErrorToast from "@/components/ui/helpers/render-error-toast";
import { toast } from "sonner";
import RenderSuccessToast from "@/components/ui/helpers/render-success-toast";

interface TransferQuoteArgs {
    from_chain: string;
    to_chain: string;
    from_token: string;
    to_token: string;
    amount: string;
    from_address: string;
    to_address: string;
    from_amount: string;
    order: "FASTEST" | "CHEAPEST" | "SAFEST";
}

interface TransferToken {
    chain: number;
    token: string;
    amount: string;
    amountFormatted: string;
    address: string;
}

interface TransferFee {
    name: string;
    amount: string;
    amountUSD: string;
    description: string;
}

interface TransferFees {
    total: number;
    totalUSD: number;
    breakdown: TransferFee[];
}

interface TransferGas {
    estimatedCost: string;
    gasLimit: string;
    gasPrice: string;
}

interface TransferExecution {
    estimatedTime: number;
    tool: string;
    toolName: string;
}

interface TransferDetails {
    from: TransferToken;
    to: TransferToken;
    fees: TransferFees;
    gas: TransferGas;
    execution: TransferExecution;
}

interface TransferTransaction {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
    chainId: number;
}

interface TransferQuoteResponse {
    success: boolean;
    transfer: TransferDetails;
    transaction: TransferTransaction;
    rawData: Record<string, unknown>; // Original LiFi response for debugging
}

export default function useTransferQuote() {
  const {mutate: transferQuoteMutation, isPending: transferQuotePending, data: transferQuoteData} =  useMutation<TransferQuoteResponse, Error, TransferQuoteArgs>({
    mutationFn: async (args: TransferQuoteArgs) => {
        const url = `${import.meta.env.VITE_SWAP_URL}/transfer?fromChain=${args.from_chain}&toChain=${args.to_chain}&fromToken=${args.from_token}&toToken=${args.to_token}&amount=${args.amount}&fromAddress=${args.from_address}&toAddress=${args.to_address}&fromAmount=${BigInt(args.from_amount)}&order=${args.order}`
        const response = await fetch(url)
        const data = await response.json()
        return data  
    },
    onSuccess: () => {
        toast.custom(() => <RenderSuccessToast message="Swap quote ready!" />, {
            position: "top-center",
            duration: 2000,
          });
    },
    onError: () => {
        toast.custom(() => <RenderErrorToast message="Swap quote fetch failed" />, {
            position: "top-center",
            duration: 2000,
          });
    }
  })

  return {
    transferQuoteMutation,
    transferQuotePending,
    transferQuoteData,
  }
}