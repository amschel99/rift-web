import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiArrowLeft, FiSmartphone } from "react-icons/fi";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useUtility, NetworkProvider } from "../context";
import ActionButton from "@/components/ui/action-button";
import rift from "@/lib/rift";

const NETWORK_OPTIONS: { value: NetworkProvider; label: string; color: string; icon: string }[] = [
  { value: "SAFARICOM", label: "Safaricom", color: "bg-green-600", icon: "📱" },
  { value: "AIRTEL", label: "Airtel", color: "bg-red-600", icon: "📱" },
  { value: "TELKOM", label: "Telkom", color: "bg-blue-600", icon: "📱" },
];

export default function AmountInput() {
  const navigate = useNavigate();
  const { utilityData, updateUtilityData, setCurrentStep } = useUtility();
  const [phoneNumber, setPhoneNumber] = useState(utilityData.phoneNumber || "");
  const [kesAmount, setKesAmount] = useState(utilityData.amount?.toString() || "");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider>(
    utilityData.network || "SAFARICOM"
  );
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  // Fetch exchange rate
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

        setExchangeRate(response.rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setExchangeRate(136); // Fallback
        toast.warning("Using approximate exchange rate");
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // Calculate minimum amount: 0.3 USDC × rate
  const minAmountKES = exchangeRate ? Math.round(0.3 * exchangeRate) : 10;

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If starts with 254, keep as is
    if (cleaned.startsWith("254")) {
      return cleaned;
    }

    // If starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      return "254" + cleaned.substring(1);
    }

    // If starts with 7, 1, add 254
    if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
      return "254" + cleaned;
    }

    // Default
    return cleaned;
  };

  const handleNext = () => {
    const amount = parseFloat(kesAmount);

    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < minAmountKES) {
      toast.error(`Minimum amount is KSh ${minAmountKES.toLocaleString()} (0.3 USDC)`);
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber.trim());

    // Validate phone number format (should be 254XXXXXXXXX)
    if (!formattedPhone.match(/^254[17]\d{8}$/)) {
      toast.error("Please enter a valid Kenyan phone number");
      return;
    }

    updateUtilityData({
      phoneNumber: formattedPhone,
      amount: amount,
      network: selectedNetwork,
    });

    setCurrentStep("confirmation");
  };

  const isValidInput = () => {
    if (!phoneNumber.trim()) return false;
    const amount = parseFloat(kesAmount);
    if (!amount || amount < minAmountKES) return false;
    return true;
  };

  return (
    <motion.div
      initial={{ x: -4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/app")} className="p-2">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Buy Airtime</h1>
        <div className="w-5 h-5" /> {/* Placeholder for alignment */}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSmartphone className="w-8 h-8 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Top Up Airtime</h2>
          <p className="text-text-subtle">
            Buy airtime instantly using your Rift balance
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-4">
          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Network <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NETWORK_OPTIONS.map((network) => (
                <button
                  key={network.value}
                  onClick={() => setSelectedNetwork(network.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedNetwork === network.value
                      ? "border-accent-primary bg-accent-primary/10"
                      : "border-surface bg-surface-subtle hover:border-surface-alt"
                  }`}
                >
                  <div className="text-2xl mb-1">{network.icon}</div>
                  <div className="text-xs font-medium">{network.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712 345 678"
              className="w-full p-3 bg-surface-subtle border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-base"
              autoFocus
            />
            <p className="text-xs text-text-subtle mt-1">
              Enter your {selectedNetwork.toLowerCase()} number
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 p-3 bg-surface-subtle border border-surface rounded-lg focus-within:ring-2 focus-within:ring-accent-primary">
              <span className="font-medium">KSh</span>
              <input
                type="number"
                value={kesAmount}
                onChange={(e) => setKesAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent border-none outline-none text-base"
              />
            </div>
            {exchangeRate && (
              <p className="text-xs text-text-subtle mt-1">
                ~{((parseFloat(kesAmount) || 0) / exchangeRate).toFixed(2)} USDC
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[50, 100, 200, 500, 1000, 2000].map((amount) => (
              <button
                key={amount}
                onClick={() => setKesAmount(amount.toString())}
                className="py-2 px-3 text-sm bg-surface-subtle rounded-lg hover:bg-surface transition-colors"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-auto">
        <ActionButton
          onClick={handleNext}
          disabled={!isValidInput() || loadingRate}
          loading={loadingRate}
          className="w-full"
        >
          {loadingRate ? "Loading..." : "Continue"}
        </ActionButton>
      </div>
    </motion.div>
  );
}

