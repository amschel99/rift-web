import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateRecoveryRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  UpdateRecoveryMethodRequest,
} from "@rift-finance/wallet";
import rift from "@/lib/rift";
import {
  validateToken as validateTokenApi,
  resetPasswordWithToken as resetPasswordWithTokenApi,
  getRecoveryOptionsByIdentifier as getRecoveryOptionsByIdentifierApi,
  requestAccountRecoveryLink as requestAccountRecoveryLinkApi,
  recoverAccount as recoverAccountApi,
  sendOtp as sendOtpApi,
  createRecoveryWithJwt as createRecoveryWithJwtApi,
  addRecoveryMethodWithJwt as addRecoveryMethodWithJwtApi,
  updateRecoveryMethodWithJwt as updateRecoveryMethodWithJwtApi,
  getMyRecoveryMethods as getMyRecoveryMethodsApi,
  removeRecoveryMethod as removeRecoveryMethodApi,
  deleteAllRecoveryMethods as deleteAllRecoveryMethodsApi,
} from "@/services/recovery-api";

// --- Existing SDK-based functions ---

async function createRecovery(args: CreateRecoveryRequest) {
  const res = await rift.auth.createRecoveryMethods({
    externalId: args.externalId,
    password: args.password,
    emailRecovery: args.emailRecovery,
    phoneRecovery: args.phoneRecovery,
  });

  return res;
}

async function addRecovery(args: UpdateRecoveryMethodRequest) {
  const res = await rift.auth.updateRecoveryMethod({
    externalId: args.externalId,
    method: args.method,
    password: args.password,
    value: args.value,
  });

  return res;
}

async function requestPasswordReset(args: RequestPasswordResetRequest) {
  const res = await rift.auth.requestPasswordReset({
    externalId: args.externalId,
    method: args.method,
  });

  return res;
}

async function resetForgotPasswordWithEmail(args: ResetPasswordRequest) {
  const res = await rift.auth.resetPassword({
    username: args.username,
    newPassword: args.newPassword,
    otpCode: args.otpCode,
    email: args.email!,
  });

  return res;
}

async function resetForgotPasswordWithPhone(args: ResetPasswordRequest) {
  const res = await rift.auth.resetPassword({
    username: args.username,
    newPassword: args.newPassword,
    otpCode: args.otpCode,
    phoneNumber: args.phoneNumber!,
  });

  return res;
}

async function getRecoveryMethods(args: { externalId: string }) {
  const res = await rift.auth.getRecoveryOptions(args.externalId);

  return res;
}

// --- Hook ---

interface UseWalletRecoveryArgs {
  externalId?: string;
  token?: string;
  identifier?: string;
  identifierType?: "email" | "phone";
}

export default function useWalletRecovery(args: UseWalletRecoveryArgs) {
  // Existing SDK mutations
  const createRecoveryMutation = useMutation({ mutationFn: createRecovery });
  const addRecoveryMutation = useMutation({ mutationFn: addRecovery });
  const requestRecoveryMutation = useMutation({
    mutationFn: requestPasswordReset,
  });
  const emailResetPasswordMutation = useMutation({
    mutationFn: resetForgotPasswordWithEmail,
  });
  const phoneResetPasswordMutation = useMutation({
    mutationFn: resetForgotPasswordWithPhone,
  });

  const recoveryMethodsQuery = useQuery({
    queryKey: ["recovery-methods", args.externalId],
    queryFn: () =>
      getRecoveryMethods({ externalId: args.externalId as string }),
    enabled: !!args.externalId,
  });

  // Recovery options by identifier (for phone/email users)
  const recoveryOptionsByIdentifierQuery = useQuery({
    queryKey: ["recovery-options-by-identifier", args.identifier, args.identifierType],
    queryFn: () =>
      getRecoveryOptionsByIdentifierApi(args.identifier!, args.identifierType!),
    enabled: !!args.identifier && !!args.identifierType,
  });

  // New token-based mutations
  const validateTokenQuery = useQuery({
    queryKey: ["validate-token", args.token],
    queryFn: () => validateTokenApi(args.token!),
    enabled: !!args.token,
    retry: false,
  });

  const resetPasswordWithTokenMutation = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      resetPasswordWithTokenApi(data.token, data.newPassword),
  });

  const getRecoveryOptionsByIdentifierMutation = useMutation({
    mutationFn: (data: {
      identifier: string;
      identifierType: "email" | "phone";
    }) =>
      getRecoveryOptionsByIdentifierApi(data.identifier, data.identifierType),
  });

  const requestAccountRecoveryLinkMutation = useMutation({
    mutationFn: (data: {
      identifier: string;
      identifierType: "email" | "phone";
      method: "emailRecovery" | "phoneRecovery";
    }) =>
      requestAccountRecoveryLinkApi(
        data.identifier,
        data.identifierType,
        data.method
      ),
  });

  const recoverAccountMutation = useMutation({
    mutationFn: (data: {
      token: string;
      newIdentifier: string;
      identifierType: "email" | "phone";
      otpCode: string;
    }) =>
      recoverAccountApi(
        data.token,
        data.newIdentifier,
        data.identifierType,
        data.otpCode
      ),
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data: { identifier: string; type: "email" | "phone" }) =>
      sendOtpApi(data.identifier, data.type),
  });

  // JWT-authenticated recovery setup (for phone/email users without passwords)
  const createRecoveryWithJwtMutation = useMutation({
    mutationFn: (data: {
      emailRecovery?: string;
      phoneRecovery?: string;
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
    }) => createRecoveryWithJwtApi(data),
  });

  const addRecoveryMethodWithJwtMutation = useMutation({
    mutationFn: (data: {
      method: "emailRecovery" | "phoneRecovery";
      value: string;
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
    }) => addRecoveryMethodWithJwtApi(data),
  });

  const updateRecoveryMethodWithJwtMutation = useMutation({
    mutationFn: (data: {
      method: "emailRecovery" | "phoneRecovery";
      value: string;
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
    }) => updateRecoveryMethodWithJwtApi(data),
  });

  const myRecoveryMethodsQuery = useQuery({
    queryKey: ["my-recovery-methods", args.externalId],
    queryFn: () => getMyRecoveryMethodsApi(args.externalId),
    enabled: !!localStorage.getItem("token"),
  });

  const removeRecoveryMethodMutation = useMutation({
    mutationFn: (data: {
      externalId?: string;
      method: "emailRecovery" | "phoneRecovery";
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
      password?: string;
    }) => removeRecoveryMethodApi(data),
  });

  const deleteAllRecoveryMethodsMutation = useMutation({
    mutationFn: (data: {
      externalId?: string;
      otpCode?: string;
      phoneNumber?: string;
      email?: string;
      password?: string;
    }) => deleteAllRecoveryMethodsApi(data),
  });

  return {
    // Existing
    createRecoveryMutation,
    addRecoveryMutation,
    recoveryMethodsQuery,
    recoveryOptionsByIdentifierQuery,
    requestRecoveryMutation,
    emailResetPasswordMutation,
    phoneResetPasswordMutation,
    // New token-based
    validateTokenQuery,
    resetPasswordWithTokenMutation,
    getRecoveryOptionsByIdentifierMutation,
    requestAccountRecoveryLinkMutation,
    recoverAccountMutation,
    sendOtpMutation,
    // JWT-authenticated recovery setup
    createRecoveryWithJwtMutation,
    addRecoveryMethodWithJwtMutation,
    updateRecoveryMethodWithJwtMutation,
    myRecoveryMethodsQuery,
    removeRecoveryMethodMutation,
    deleteAllRecoveryMethodsMutation,
  };
}
