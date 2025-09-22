import { formatDistanceToNow } from "date-fns";
import { Smartphone, Copy } from "lucide-react";
import { toast } from "sonner";
import { OfframpOrder } from "@/hooks/data/use-withdrawal-orders";

interface WithdrawalCardProps {
  order: OfframpOrder;
}

export default function WithdrawalCard({ order }: WithdrawalCardProps) {
  const copyTransactionCode = () => {
    navigator.clipboard.writeText(order.transactionCode);
    toast.success("Transaction code copied!");
  };

  const copyMpesaCode = () => {
    if (order.receipt_number) {
      navigator.clipboard.writeText(order.receipt_number);
      toast.success("M-Pesa code copied!");
    }
  };

  return (
    <div className="bg-surface-subtle rounded-md p-3 border border-surface">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-3 h-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-text-default">M-Pesa</h3>
            <p className="text-xs text-text-subtle">
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Amount */}
        <p className="text-sm font-semibold text-text-default">
          KSh {Number(order.amount || 0).toFixed(2)}
        </p>
        
        {/* Transaction Code */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-text-subtle truncate flex-1">
            {order.transactionCode}
          </p>
          <button
            onClick={copyTransactionCode}
            className="ml-2 p-1 text-xs bg-surface hover:bg-surface-alt rounded transition-colors"
            title="Copy Transaction Code"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>

        {/* M-Pesa Receipt Number (if available) */}
        {order.receipt_number && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-text-subtle truncate flex-1">
              M-Pesa: {order.receipt_number}
            </p>
            <button
              onClick={copyMpesaCode}
              className="ml-2 text-xs text-accent-primary hover:text-accent-secondary transition-colors"
              title="Copy M-Pesa Code"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}