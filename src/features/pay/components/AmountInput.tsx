import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";
import { usePay } from "../context";
import ActionButton from "@/components/ui/action-button";
import rift from "@/lib/rift";
import type { SupportedCurrency } from "@/hooks/data/use-base-usdc-balance";

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  KES: "KSh",
  NGN: "₦",
  ETB: "Br",
  UGX: "USh",
  GHS: "₵",
  USD: "$",
};

export default function AmountInput() {
  const { paymentData, updatePaymentData, setCurrentStep } = usePay();
  const [localAmount, setLocalAmount] = useState("");
  const [buyingRate, setBuyingRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  const currency = (paymentData.currency || "KES") as SupportedCurrency;
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  // Fetch exchange rate to get buying_rate for minimum payment calculation
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        rift.setBearerToken(authToken);

        if (currency === "USD") {
          setBuyingRate(1);
          setLoadingRate(false);
          return;
        }

        const response = await rift.offramp.previewExchangeRate({
          currency: currency as any,
        });

        // Minimum payment is 1 USDC × buying_rate
        setBuyingRate((response as any).buying_rate || response.rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        // Fallback rates
        const fallbackRates: Record<SupportedCurrency, number> = {
          KES: 136,
          ETB: 62.5,
          UGX: 3700,
          GHS: 15.8,
          NGN: 1580,
          USD: 1,
        };
        setBuyingRate(fallbackRates[currency]);
        toast.warning("Using approximate exchange rate");
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, [currency]);

  // Calculate minimum payment: 0.3 USDC × buying_rate
  const minPaymentLocal = buyingRate ? Math.round(0.3 * buyingRate) : 10;

  const handleBack = () => {
    if (paymentData.currency === "KES") {
      setCurrentStep("type");
    } else {
      setCurrentStep("country");
    }
  };

  const handleNext = () => {
    const amount = parseFloat(localAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < minPaymentLocal) {
      toast.error(
        `Minimum payment is ${currencySymbol} ${minPaymentLocal.toLocaleString()} (0.3 USDC)`
      );
      return;
    }

    updatePaymentData({
      amount: amount,
    });
    setCurrentStep("recipient");
  };

  const isValidAmount = localAmount && parseFloat(localAmount) >= minPaymentLocal;

  const getPaymentTypeLabel = () => {
    if (paymentData.type === "MOBILE") return "Send Money";
    if (paymentData.type === "PAYBILL") return "Paybill Payment";
    if (paymentData.type === "BUY_GOODS") return "Buy Goods Payment";
    
    // For non-Kenya countries
    const countryNames: Record<SupportedCurrency, string> = {
      KES: "Kenya",
      ETB: "Ethiopia",
      UGX: "Uganda",
      GHS: "Ghana",
      NGN: "Nigeria",
      USD: "International",
    };
    return `Send to ${countryNames[currency]}`;
  };

  // Dynamic quick amounts based on currency
  const getQuickAmounts = () => {
    const min = minPaymentLocal;
    switch (currency) {
      case "KES":
        return [min, 100, 500, 1000, 2000, 5000];
      case "ETB":
        return [min, 100, 500, 1000, 2000, 5000];
      case "UGX":
        return [min, 5000, 10000, 50000, 100000, 500000];
      case "GHS":
        return [min, 20, 50, 100, 500, 1000];
      case "NGN":
        return [min, 1000, 5000, 10000, 50000, 100000];
      case "USD":
        return [1, 5, 10, 20, 50, 100];
      default:
        return [min, 100, 500, 1000, 2000, 5000];
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
        <p className="text-text-subtle">How much do you want to send?</p>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-lg font-medium mr-2">{currencySymbol}</span>
            <input
              type="number"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              placeholder="0"
              className="text-4xl font-bold bg-transparent border-none outline-none text-center w-full"
              autoFocus
            />
          </div>
          <p className="text-sm text-text-subtle">Sending in {currency}</p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {getQuickAmounts()
            .filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates
            .sort((a, b) => a - b)
            .slice(0, 6)
            .map((amount) => (
              <button
                key={amount}
                onClick={() => setLocalAmount(amount.toString())}
                className="p-3 bg-surface-subtle rounded-lg hover:bg-surface transition-colors text-sm font-medium"
              >
                {amount.toLocaleString()}
              </button>
            ))}
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
