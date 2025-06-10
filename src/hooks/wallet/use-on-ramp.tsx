import { useMutation, useQuery } from "@tanstack/react-query";
import {
  MpesaSTKInitiateRequest,
  MpesaSTKInitiateResponse,
} from "@stratosphere-network/wallet";
import sphere from "@/lib/sphere";

interface UseOnRampParams {
  tx_args?: MpesaSTKInitiateRequest;
  onSuccess?: (ONRAMP_RES: MpesaSTKInitiateResponse) => void;
  onError?: () => void;
  checkoutRequestId?: string;
  merchantId?: string;
  externalReference?: string;
}

function getUsdExchangeRate() {
  return 136;
}

export default function useOnRamp(params: UseOnRampParams = {}) {
  const {
    tx_args,
    onSuccess,
    onError,
    checkoutRequestId,
    merchantId,
    externalReference,
  } = params;

  const onrampmutation = useMutation({
    mutationFn: async (args: MpesaSTKInitiateRequest) => {
      const res = await sphere.onramp.initiateSafaricomSTK(args);
      if (res?.success) {
        onSuccess?.(res);
      } else {
        onError?.();
      }
      return res;
    },
    onError: () => {
      onError?.();
    },
  });

  const onrampstatusquery = useQuery({
    queryKey: ["onrampstatus", checkoutRequestId, merchantId],
    queryFn: async () =>
      await sphere.onramp.pollSafaricomTransactionStatus(checkoutRequestId, merchantId),
    enabled: !!(checkoutRequestId && merchantId),
  });

  const onramphistory = useQuery({
    queryKey: ["onramphistory", externalReference],
    queryFn: async () =>
      sphere.onramp.getUserTransactionHistory({
        externalReference: externalReference!,
      }),
    enabled: !!externalReference,
  });

  return {
    onrampmutation,
    onrampstatusquery,
    onramphistory,
    USD_EXCHANGE_RATE: getUsdExchangeRate(),
  };
}
