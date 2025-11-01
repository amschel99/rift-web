import { createContext, useContext, useState, ReactNode } from "react";

export type UtilityStep = "amount" | "confirmation";
export type NetworkProvider = "SAFARICOM" | "AIRTEL" | "TELKOM";

export interface UtilityData {
  phoneNumber?: string;
  amount?: number; // KES amount
  network?: NetworkProvider;
}

interface UtilityContextType {
  utilityData: UtilityData;
  updateUtilityData: (data: Partial<UtilityData>) => void;
  currentStep: UtilityStep;
  setCurrentStep: (step: UtilityStep) => void;
  resetUtility: () => void;
}

const UtilityContext = createContext<UtilityContextType | undefined>(undefined);

export const UtilityProvider = ({ children }: { children: ReactNode }) => {
  const [utilityData, setUtilityData] = useState<UtilityData>({});
  const [currentStep, setCurrentStep] = useState<UtilityStep>("amount");

  const updateUtilityData = (data: Partial<UtilityData>) => {
    setUtilityData((prev) => ({ ...prev, ...data }));
  };

  const resetUtility = () => {
    setUtilityData({});
    setCurrentStep("amount");
  };

  return (
    <UtilityContext.Provider
      value={{
        utilityData,
        updateUtilityData,
        currentStep,
        setCurrentStep,
        resetUtility,
      }}
    >
      {children}
    </UtilityContext.Provider>
  );
};

export const useUtility = () => {
  const context = useContext(UtilityContext);
  if (!context) {
    throw new Error("useUtility must be used within a UtilityProvider");
  }
  return context;
};

