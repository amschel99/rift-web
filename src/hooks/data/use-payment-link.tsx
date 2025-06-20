import { getChains } from "@/lib/assets/chains";
import { getTokens } from "@/lib/assets/tokens";
import { WalletChain } from "@/lib/entities";
import sphere from "@/lib/sphere";
import { useMutation } from "@tanstack/react-query";

interface CreatePaymentLinkArgs {
  chain: string;
  token: string;
  duration: string;
  amount: string;
  recipient?: string;
  type?: "specific" | "open";
}

interface CreatePaymentLinkResponse {
  link: string;
}

interface PayRequestLinkArgs {
  nonce: string;
}

interface createPaymentRequestArgs {
  amount: string;
  chain: string;
  token: string;
}

interface CollectFromSendLinkArgs {
  id: string;
}

async function createPaymentLink(
  args: CreatePaymentLinkArgs
): Promise<CreatePaymentLinkResponse> {
  const tokens = await getTokens({
    id: args.token,
    chain: args.chain,
  });

  const chain = (await getChains(args?.chain)) as WalletChain | null;

  const token = tokens?.at(0);

  if (!token) throw new Error("Token not found");
  if (!chain) throw new Error("Chain not found");

  const response =
    args.type == "specific"
      ? await sphere.paymentLinks.createSpecificSendLink({
          chain: chain?.backend_id as any,
          time: args.duration,
          token: token?.name as any,
          value: args.amount,
          phoneNumber: args.recipient!,
        })
      : await sphere.paymentLinks.createOpenSendLink({
          chain: chain?.backend_id as any,
          time: args.duration,
          token: token?.name as any,
          value: args.amount,
        });

  const url = response?.data;

  return {
    link: url,
  };
}

async function createRequestLink(args: createPaymentRequestArgs) {
  const response = await sphere.paymentLinks.requestPayment({
    amount: parseFloat(args?.amount),
    chain: args?.chain as any,
    token: args?.token as any,
  });

  return { link: response?.data };
}

async function payToRequestLink(args: PayRequestLinkArgs) {
  const res = await sphere.paymentLinks.payPaymentRequest(args.nonce);

  return res;
}

async function collectFromLink(args: CollectFromSendLinkArgs) {
  const res = await sphere.paymentLinks.claimOpenSendLink({ id: args.id });
  return res;
}

export default function usePaymentLinks() {
  const createPaymentLinkMutation = useMutation({
    mutationFn: createPaymentLink,
  });

  const createRequestLinkMutation = useMutation({
    mutationFn: createRequestLink,
  });

  const payRequestPaymentLink = useMutation({ mutationFn: payToRequestLink });

  const collectFromSendLink = useMutation({ mutationFn: collectFromLink });

  return {
    createPaymentLinkMutation,
    createRequestLinkMutation,
    payRequestPaymentLink,
    collectFromSendLink,
  };
}
