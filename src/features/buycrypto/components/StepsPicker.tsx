import { toast } from "sonner";
import { useNavigate } from "react-router";
import { BuyRequest, BuyResponse, RampChain, RampToken } from "@rift-finance/wallet";
import { useBuyCrypto, buyTokens } from "../context";
import useOnRamp from "@/hooks/wallet/use-on-ramp";
import useAnalytics from "@/hooks/use-analytics";
import ActionButton from "@/components/ui/action-button";

export default function StepsPicker() {
  const navigate = useNavigate();
  const { state, switchCurrentStep } = useBuyCrypto();
  const { logEvent } = useAnalytics();

  const formaValues = state?.getValues();
  const cryptoAmount = Number(formaValues?.cryptoAmount);
  const kesAmount = Number(state?.watch("kesAmount"));
  const mpesaNumber = formaValues?.mpesaNumber as string;
  const purchaseToken = formaValues?.purchaseToken as string as buyTokens;
  const currentStep = state?.watch("currentStep");

  const { onRampMutation } = useOnRamp({
    onSuccess: (res: BuyResponse) => {
      logEvent("ONRAMP_INITIATED", {
        checkout_request_id: res?.transaction_code,
        amount: kesAmount,
        currency: "KES",
        crypto_asset: purchaseToken,
        payment_method: "mpesa_stk",
        phone: mpesaNumber,
      });

      switchCurrentStep("CONFIRM");
      state?.setValue("checkoutRequestId", res?.transaction_code);
    },
    onError: (error: any) => {
      logEvent("ONRAMP_FAILED", {
        amount: kesAmount,
        currency: "KES",
        crypto_asset: purchaseToken,
        payment_method: "mpesa_stk",
        error: error?.message || "Unknown error",
      });

      const isKYC = error?.error === "KYC verification required" || error?.message?.toLowerCase().includes("kyc");
      toast.error(isKYC ? "You've reached the transaction limit. Verify your identity to continue." : (error?.message || "Sorry, we couldn't process the transaction"), isKYC ? {
        action: { label: "Verify now", onClick: () => navigate("/kyc") },
      } : undefined);
    },
  });

  const tx_args: BuyRequest = {
    shortcode: mpesaNumber,
    amount: kesAmount,
    chain: RampChain.BASE,
    asset: RampToken.USDC,
    mobile_network: "Safaricom",
    country_code: "KES",
  };

  const onCancel = () => {
    navigate("/app");
  };

  const onNextStep = () => {
    if (currentStep == "CHOOSE-TOKEN") {
      switchCurrentStep("CRYPTO-AMOUNT");
    }

    if (currentStep == "CRYPTO-AMOUNT" && cryptoAmount !== 0) {
      switchCurrentStep("PHONE");
    }

    if (currentStep == "PHONE" && mpesaNumber !== "" && cryptoAmount !== 0) {
      toast.success("Please confirm the transaction on your phone");
      switchCurrentStep("CONFIRM");
      onRampMutation.mutate(tx_args);
    }
  };

  return (
    <div className="flex flex-row flex-nowrap gap-3 fixed bottom-0 left-0 right-0 p-4 py-2 border-t-1 border-border bg-app-background">
      <ActionButton
        onClick={onCancel}
        variant="ghost"
        className="font-medium border-0 bg-secondary hover:bg-surface-subtle transition-all"
      >
        Cancel
      </ActionButton>

      <ActionButton
        variant="secondary"
        onClick={onNextStep}
        disabled={
          (currentStep == "CRYPTO-AMOUNT" && cryptoAmount == 0) ||
          isNaN(cryptoAmount) ||
          (currentStep == "PHONE" && mpesaNumber == "")
        }
        className="font-medium border-0"
      >
        {currentStep == "CHOOSE-TOKEN" || currentStep == "CRYPTO-AMOUNT"
          ? "Next"
          : "Buy"}
      </ActionButton>
    </div>
  );
}
