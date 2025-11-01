import { UtilityProvider, useUtility } from "./context";
import AmountInput from "./components/AmountInput";
import Confirmation from "./components/Confirmation";

function UtilitiesContent() {
  const { currentStep } = useUtility();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "amount":
        return <AmountInput />;
      case "confirmation":
        return <Confirmation />;
      default:
        return <AmountInput />;
    }
  };

  return (
    <div className="h-screen bg-background text-text-default flex flex-col overflow-hidden">
      {renderCurrentStep()}
    </div>
  );
}

export default function Utilities() {
  return (
    <UtilityProvider>
      <UtilitiesContent />
    </UtilityProvider>
  );
}

