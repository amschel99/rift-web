import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { RequestProvider, useRequest, RequestType } from "./context";
import AmountInput from "./components/AmountInput";
import DescriptionInput from "./components/DescriptionInput";
import SharingOptions from "./components/SharingOptions";

function RequestContainer() {
  const { currentStep, setRequestType } = useRequest();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type') as RequestType;
    if (type === 'request' || type === 'topup') {
      setRequestType(type);
    }
  }, [searchParams, setRequestType]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "amount":
        return <AmountInput />;
      case "description":
        return <DescriptionInput />;
      case "sharing":
        return <SharingOptions />;
      default:
        return <AmountInput />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderCurrentStep()}
    </div>
  );
}

export default function Request() {
  return (
    <RequestProvider>
      <RequestContainer />
    </RequestProvider>
  );
}