import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BuyRequest,
  BuyResponse,
} from "@rift-finance/wallet";
import rift from "@/lib/rift";

interface UseOnRampParams {
  onSuccess?: (res: BuyResponse) => void;
  onError?: (error?: unknown) => void;
  checkoutRequestId?: string;
  enableStatusPolling?: boolean;
}

function getUsdExchangeRate() {
  return 136;
}

export default function useOnRamp(params: UseOnRampParams = {}) {
  const {
    onSuccess,
    onError,
    checkoutRequestId,
    enableStatusPolling = true,
  } = params;

  const onRampMutation = useMutation({
    mutationFn: async (args: BuyRequest) => {
      const res = await rift.onrampV2.buy(args);
      if (res?.success) {
        onSuccess?.(res);
      } else {
        onError?.(res);
      }
      return res;
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const onRampStatusQuery = useQuery({
    queryKey: ["onrampstatus", checkoutRequestId],
    queryFn: async () =>
      await rift.onrampV2.getOnrampStatus(checkoutRequestId!),
    enabled: !!(checkoutRequestId && enableStatusPolling),
    refetchInterval: enableStatusPolling ? 3000 : false,
    refetchIntervalInBackground: true,
    retry: false,
  });

  return {
    onRampMutation,
    onRampStatusQuery,
    USD_EXCHANGE_RATE: getUsdExchangeRate(),
  };
}
