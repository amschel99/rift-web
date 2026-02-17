import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router";
import { useRequest } from "../context";
import ActionButton from "@/components/ui/action-button";
import useCountryDetection from "@/hooks/data/use-country-detection";
import { SUPPORTED_CURRENCIES, Currency } from "@/components/ui/currency-selector";
import { useOfframpFeePreview, calculateOnrampFeeBreakdown } from "@/hooks/data/use-offramp-fee";
import type { SupportedCurrency } from "@/hooks/data/use-base-usdc-balance";
import useDesktopDetection from "@/hooks/use-desktop-detection";

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  KES: "KSh",
  NGN: "₦",
  ETB: "Br",
  UGX: "USh",
  GHS: "₵",
  USD: "$",
};

export default function AmountInput() {
  const navigate = useNavigate();
  const { updateRequestData, setCurrentStep, requestType } = useRequest();
  const [localAmount, setLocalAmount] = useState("");
  const { data: countryInfo, isLoading: countryLoading } = useCountryDetection();
  const isDesktop = useDesktopDetection();

  // Get selected currency from localStorage or detected country
  const getInitialCurrency = (): Currency => {
    const stored = localStorage.getItem("selected_currency");
    if (stored) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === stored);
      if (found) return found;
    }
    if (countryInfo?.currency) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === countryInfo.currency);
      if (found) return found;
    }
    return SUPPORTED_CURRENCIES.find((c) => c.code === "USD")!;
  };

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(getInitialCurrency());

  // Fetch fee preview for top-ups (onramp)
  const { data: feePreview } = useOfframpFeePreview(
    selectedCurrency.code, 
    requestType === "topup" && selectedCurrency.code !== "USD"
  );

  // Calculate fee breakdown for top-ups
  const feeBreakdown = useMemo(() => {
    const amount = parseFloat(localAmount);
    if (!feePreview || isNaN(amount) || amount <= 0 || requestType !== "topup" || selectedCurrency.code === "USD") {
      return null;
    }
    return calculateOnrampFeeBreakdown(amount, feePreview);
  }, [localAmount, feePreview, requestType, selectedCurrency.code]);

  useEffect(() => {
    if (countryInfo?.currency && !localStorage.getItem("selected_currency")) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === countryInfo.currency);
      if (found) {
        setSelectedCurrency(found);
      }
    }
  }, [countryInfo]);

  const handleNext = () => {
    if (!localAmount || parseFloat(localAmount) <= 0) return;
    
    if (requestType === "topup") {
      // For top-ups, skip description and go straight to creating the invoice
      updateRequestData({
        amount: parseFloat(localAmount),
        currency: selectedCurrency.code,
        description: "Rift wallet top-up",
        feeBreakdown: feeBreakdown || undefined,
      });
      // We'll handle the invoice creation in the sharing options component
      setCurrentStep("sharing");
    } else {
      // For requests, go to description step
      updateRequestData({
        amount: parseFloat(localAmount),
        currency: selectedCurrency.code,
      });
      setCurrentStep("description");
    }
  };

  const isValidAmount = localAmount && parseFloat(localAmount) > 0;

  return (
    <motion.div
      initial={{ x: -4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full h-full flex flex-col"
    >
      <div className={`w-full h-full flex flex-col ${isDesktop ? "max-w-2xl mx-auto" : ""}`}>
        {/* Header */}
        <div className="flex items-center px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
          <button
            onClick={() => navigate("/app")}
            className="mr-4 p-2 rounded-2xl hover:bg-accent-primary/10 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-accent-primary" />
          </button>
          <h1 className="text-xl font-semibold text-text-default">
            {requestType === "topup" ? "Top Up Account" : "Request Payment"}
          </h1>
        </div>

        {/* Amount Input */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:p-6">
          <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-text-default mb-2">Enter Amount</h2>
            <p className="text-text-subtle">
              {requestType === "topup" 
                ? "How much do you want to add to your account?" 
                : "How much do you want to request?"
              }
            </p>
          </div>

          {/* Currency Info */}
          <div className="text-center mb-4 md:mb-6">
            <span className="text-xs md:text-sm text-text-subtle bg-accent-primary/10 px-3 py-1.5 rounded-full">
              {countryLoading ? "Detecting currency..." : `Requesting in ${selectedCurrency.code}`}
            </span>
          </div>

          {/* Amount Input Field */}
          <div className="bg-white rounded-2xl border-2 border-accent-primary/20 px-5 py-6 md:p-8 mb-4 md:mb-6">
            <div className="flex items-center justify-center">
              <span className="text-2xl font-medium mr-3 text-accent-primary">{CURRENCY_SYMBOLS[selectedCurrency.code as SupportedCurrency]}</span>
              <input
                type="number"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                placeholder="0"
                className="text-5xl font-bold bg-transparent border-none outline-none text-center w-full text-text-default placeholder:text-gray-300"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Amount Buttons - Dynamic based on currency */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
            {(() => {
              const quickAmounts = 
                selectedCurrency.code === "KES" ? [100, 500, 1000, 2000, 5000, 10000] :
                selectedCurrency.code === "ETB" ? [50, 100, 500, 1000, 2000, 5000] :
                selectedCurrency.code === "UGX" ? [1000, 5000, 10000, 50000, 100000, 500000] :
                selectedCurrency.code === "GHS" ? [10, 50, 100, 200, 500, 1000] :
                selectedCurrency.code === "NGN" ? [500, 1000, 5000, 10000, 50000, 100000] :
                [5, 10, 20, 50, 100, 500]; // USD
              
              return quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setLocalAmount(amount.toString())}
                  className={`py-2.5 px-3 text-xs md:text-sm font-medium rounded-2xl transition-all ${
                    localAmount === amount.toString()
                      ? "bg-accent-primary text-white shadow-md"
                      : "bg-white border border-gray-200 text-text-default hover:border-accent-primary hover:bg-accent-primary/5"
                  }`}
                >
                  {amount.toLocaleString()}
                </button>
              ));
            })()}
          </div>

        </div>
      </div>

        {/* Next Button */}
        <div className={`px-4 py-4 md:p-6 ${isDesktop ? "max-w-md mx-auto w-full" : ""}`}>
          <ActionButton
            onClick={handleNext}
            disabled={!isValidAmount}
            className={`${isDesktop ? "max-w-sm mx-auto" : "w-full"} rounded-2xl`}
          >
            Next
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
}