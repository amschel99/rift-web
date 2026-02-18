import { createContext, ReactNode, useContext } from "react";
import { z } from "zod";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { LoginResponse } from "@rift-finance/wallet";
import useWalletAuth, { signInArgs } from "@/hooks/wallet/use-wallet-auth";
import useWalletRecovery from "@/hooks/wallet/use-wallet-recovery";

export const recoverySchema = z.object({
  emailAddress: z.string().optional(),
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  phonesearchfilter: z.string().optional(),
  externalId: z.string().optional(),
  password: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export type RECOVERY_SCHEMA_TYPE = z.infer<typeof recoverySchema>;

interface RecoveryContext {
  signInMutation: UseMutationResult<
    LoginResponse,
    Error,
    signInArgs,
    unknown
  > | null;
  addRecoveryMethodWithJwtMutation: UseMutationResult<
    { message: string },
    Error,
    {
      method: "emailRecovery" | "phoneRecovery";
      value: string;
      externalId?: string;
      password?: string;
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
    },
    unknown
  > | null;
  updateRecoveryMethodWithJwtMutation: UseMutationResult<
    { message: string },
    Error,
    {
      method: "emailRecovery" | "phoneRecovery";
      value: string;
      externalId?: string;
      password?: string;
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
    },
    unknown
  > | null;
  myRecoveryMethodsQuery: UseQueryResult<{
    recovery: {
      id: string;
      email: string | null;
      phoneNumber: string | null;
      createdAt?: string;
      updatedAt?: string;
    } | null;
  }> | null;
}

const RecoveryContext = createContext<RecoveryContext>({
  signInMutation: null,
  addRecoveryMethodWithJwtMutation: null,
  updateRecoveryMethodWithJwtMutation: null,
  myRecoveryMethodsQuery: null,
});

interface Props {
  children: ReactNode;
}

export default function RecoveryContextProvider(props: Props) {
  const { children } = props;

  const { signInMutation } = useWalletAuth();
  const {
    addRecoveryMethodWithJwtMutation,
    updateRecoveryMethodWithJwtMutation,
    myRecoveryMethodsQuery,
  } = useWalletRecovery({});

  return (
    <RecoveryContext.Provider
      value={{
        signInMutation,
        addRecoveryMethodWithJwtMutation,
        updateRecoveryMethodWithJwtMutation,
        myRecoveryMethodsQuery,
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);

  return context;
}
