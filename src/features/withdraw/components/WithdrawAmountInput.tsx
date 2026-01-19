import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useWithdraw } from "../context";
import useUser from "@/hooks/data/use-user";
import useBaseUSDCBalance, { SupportedCurrency } from "@/hooks/data/use-base-usdc-balance";
import ActionButton from "@/components/ui/action-button";
import rift from "@/lib/rift";

// Currency symbols map
const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  KES: "KSh",
  NGN: "₦",
  ETB: "Br",
  UGX: "USh",
  GHS: "₵",
  USD: "$",
};

export default function WithdrawAmountInput() {
  const navigate = useNavigate();
  const { updateWithdrawData, setCurrentStep } = useWithdraw();
  const { data: user } = useUser();
  
  // Get payment account currency
  const paymentAccountCurrency: SupportedCurrency = (() => {
    const paymentAccount = user?.paymentAccount || user?.payment_account;
    if (paymentAccount) {
      try {
        const account = JSON.parse(paymentAccount);
        return account.currency || "KES";
      } catch {
        return "KES";
      }
    }
    return "KES";
  })();

  const { data: balanceData, isLoading: balanceLoading } = useBaseUSDCBalance({
    currency: paymentAccountCurrency,
  });
  
  const [localAmount, setLocalAmount] = useState("");
  const [buyingRate, setBuyingRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  // Check if user has payment account configured
  const hasPaymentAccount = !!(user?.paymentAccount || user?.payment_account);

  // Get balance in local currency
  const localBalance = balanceData?.localAmount || 0;
  const currencySymbol = CURRENCY_SYMBOLS[paymentAccountCurrency];
  const currencyCode = paymentAccountCurrency;

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
          currency: paymentAccountCurrency as any,
        });

        setBuyingRate((response as any).buying_rate || response.rate);
      } catch (error) {
        
        // Fallback rates by currency
        const fallbackRates: Record<SupportedCurrency, number> = {
          KES: 136,
          NGN: 1650,
          ETB: 125,
          UGX: 3850,
          GHS: 16,
          USD: 1,
        };
        setBuyingRate(fallbackRates[paymentAccountCurrency]);
        toast.warning("Using approximate exchange rate");
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, [paymentAccountCurrency]);

  // Calculate minimum withdrawal: 0.3 USDC × buying_rate
  const minWithdrawalLocal = buyingRate ? Math.round(0.3 * buyingRate) : 10;

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value);

    // Allow empty input or valid numbers
    if (value === "" || !isNaN(numericValue)) {
      // If there's a balance limit, don't allow typing beyond available amount
      if (localBalance && numericValue > localBalance) {
        toast.error(
          `Maximum withdrawal amount is ${currencySymbol} ${localBalance.toLocaleString()}`
        );
        return;
      }
      setLocalAmount(value);
    }
  };

  const handleNext = () => {
    const amount = parseFloat(localAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < minWithdrawalLocal) {
      toast.error(
        `Minimum withdrawal is ${currencySymbol} ${minWithdrawalLocal.toLocaleString()} (0.3 USDC)`
      );
      return;
    }

    // Check if user has sufficient balance
    if (localBalance && amount > localBalance) {
      toast.error(
        `Insufficient balance. You can withdraw up to ${currencySymbol} ${localBalance.toLocaleString()}.`
      );
      return;
    }

    updateWithdrawData({ amount, currency: currencyCode });
    setCurrentStep("confirmation");
  };

  const handleSetupPaymentAccount = () => {
    navigate("/app/profile");
    toast.info("Please setup your withdrawal account in profile settings");
  };

  const isValidAmount = localAmount && parseFloat(localAmount) >= minWithdrawalLocal;

  if (!hasPaymentAccount) {
    return (
      <motion.div
        initial={{ x: -4, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col h-full p-4 items-center justify-center"
      >
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
          <FiAlertCircle className="w-8 h-8 text-yellow-500" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Setup Required</h2>
        <p className="text-text-subtle text-center mb-8 max-w-sm">
          You need to setup a withdrawal account before you can withdraw funds.
        </p>

        <div className="w-full max-w-sm space-y-3">
          <ActionButton onClick={handleSetupPaymentAccount} className="w-full">
            Setup Withdrawal Account
          </ActionButton>

          <ActionButton
            onClick={() => navigate("/app")}
            className="w-full bg-surface-subtle text-text-subtle"
          >
            Go Back
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full p-4"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/app")} className="p-2">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Withdraw Funds</h1>
        <div className="w-5 h-5" /> {/* Placeholder for alignment */}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium mb-2">Enter Amount</h2>
        <p className="text-text-subtle">How much do you want to withdraw?</p>
        <p className="text-xs text-text-subtle mt-2">
          Withdrawing in {currencyCode} to your linked account
        </p>
      </div>

      {/* Withdrawal Account Info */}
      {hasPaymentAccount && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💳 Linked Account: {(() => {
              const paymentAccount = user?.paymentAccount || user?.payment_account;
              if (paymentAccount) {
                try {
                  const account = JSON.parse(paymentAccount);
                  return `${account.institution} (${account.currency})`;
                } catch {
                  return "Account configured";
                }
              }
              return "";
            })()}
          </p>
        </div>
      )}

      {/* Balance Display */}
      {!balanceLoading && localBalance > 0 && (
        <div className="bg-surface-subtle rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-text-subtle text-sm">Available Balance</p>
            <p className="text-xl font-bold">
              {currencySymbol} {localBalance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {balanceLoading && (
        <div className="bg-surface-subtle rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-text-subtle text-sm">Available Balance</p>
            <p className="text-xl font-bold">Loading...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-lg font-medium mr-2">{currencySymbol}</span>
            <input
              type="number"
              value={localAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="text-4xl font-bold bg-transparent border-none outline-none text-center w-full"
              autoFocus
              max={localBalance || undefined}
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[minWithdrawalLocal, 100, 500, 1000, 2000, 5000]
            .filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates
            .filter((amount) => !localBalance || amount <= localBalance)
            .sort((a, b) => a - b)
            .map((amount) => (
              <button
                key={amount}
                onClick={() => setLocalAmount(amount.toString())}
                className="p-3 bg-surface-subtle rounded-lg hover:bg-surface transition-colors text-sm font-medium"
              >
                {currencySymbol} {amount.toLocaleString()}
              </button>
            ))}

          {/* Add "Max" button if balance is available and not already in the list */}
          {localBalance &&
            localBalance > minWithdrawalLocal &&
            ![minWithdrawalLocal, 100, 500, 1000, 2000, 5000].includes(
              localBalance
            ) && (
              <button
                onClick={() => setLocalAmount(localBalance.toString())}
                className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg hover:bg-accent-primary/20 transition-colors text-sm font-medium text-accent-primary"
              >
                Max: {currencySymbol} {localBalance.toLocaleString()}
              </button>
            )}
        </div>
      </div>

      <div className="mt-auto">
        <ActionButton
          onClick={handleNext}
          disabled={!isValidAmount || loadingRate}
          loading={loadingRate}
          className="w-full"
        >
          {loadingRate ? "Loading..." : "Continue"}
        </ActionButton>
      </div>
    </motion.div>
  );
}
