import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";
import { usePay } from "../context";
import ActionButton from "@/components/ui/action-button";
import rift from "@/lib/rift";

export default function AmountInput() {
  const { paymentData, updatePaymentData, setCurrentStep } = usePay();
  const [kesAmount, setKesAmount] = useState("");
  const [buyingRate, setBuyingRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  // Fetch exchange rate to get buying_rate for minimum payment calculation
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        rift.setBearerToken(authToken);

        const response = await rift.offramp.previewExchangeRate({
          currency: "KES" as any,
        });

        // Minimum payment is 1 USDC × buying_rate
        setBuyingRate((response as any).buying_rate || response.rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        // Fallback
        setBuyingRate(136);
        toast.warning("Using approximate exchange rate");
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // Calculate minimum payment: 1 USDC × buying_rate
  const minPaymentKES = buyingRate ? Math.ceil(1 * buyingRate) : 30;

  const handleBack = () => {
    setCurrentStep("type");
  };

  const handleNext = () => {
    const amount = parseFloat(kesAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < minPaymentKES) {
      toast.error(
        `Minimum payment amount is KSh ${minPaymentKES.toLocaleString()}`
      );
      return;
    }

    updatePaymentData({
      amount: amount,
    });
    setCurrentStep("recipient");
  };

  const isValidAmount = kesAmount && parseFloat(kesAmount) >= minPaymentKES;

  const getPaymentTypeLabel = () => {
    switch (paymentData.type) {
      case "MOBILE":
        return "Send Money";
      case "PAYBILL":
        return "Paybill Payment";
      case "BUY_GOODS":
        return "Buy Goods Payment";
      default:
        return "Payment";
    }
  };

  return (
    <motion.div
      initial={{ x: -4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full p-4"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={handleBack} className="p-2">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">{getPaymentTypeLabel()}</h1>
        <div className="w-5 h-5" /> {/* Placeholder for alignment */}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium mb-2">Enter Amount</h2>
        <p className="text-text-subtle">How much do you want to pay?</p>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-lg font-medium mr-2">KSh</span>
            <input
              type="number"
              value={kesAmount}
              onChange={(e) => setKesAmount(e.target.value)}
              placeholder="0"
              className="text-4xl font-bold bg-transparent border-none outline-none text-center w-full"
              autoFocus
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[minPaymentKES, 100, 200, 500, 1000, 2000]
            .filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates
            .sort((a, b) => a - b)
            .map((amount) => (
              <button
                key={amount}
                onClick={() => setKesAmount(amount.toString())}
                className="p-3 bg-surface-subtle rounded-lg hover:bg-surface transition-colors text-sm font-medium"
              >
                KSh {amount.toLocaleString()}
              </button>
            ))}
        </div>

        {/* Minimum Amount Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ℹ️ Minimum payment amount is KSh {minPaymentKES.toLocaleString()} (1
            USDC)
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <ActionButton
          onClick={handleNext}
          disabled={!isValidAmount || loadingRate}
          loading={loadingRate}
          className="w-full"
        >
          {loadingRate ? "Loading..." : "Next"}
        </ActionButton>
      </div>
    </motion.div>
  );
}
