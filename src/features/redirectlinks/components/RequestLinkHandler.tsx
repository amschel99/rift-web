import ActionButton from "@/components/ui/action-button";
import useGeckoPrice from "@/hooks/data/use-gecko-price";
import useToken from "@/hooks/data/use-token";
import { formatNumberUsd } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  requestLinkNonceId: string;
}

export default function RequestLinkHandler(props: Props) {
  const { data: TOKEN_INFO } = useToken({ name: "USDC.e" });
  const { convertedAmount } = useGeckoPrice({
    amount: 0.5,
    base: "usd",
    token: TOKEN_INFO?.id,
  });

  const onReceive = () => {
    toast.success("You successfully paid 0.05 USDC.e");
  };

  return (
    <div>
      <p className="text-center">
        You received a payment request <br />
        Click <span className="font-semibold">"Pay Now"</span> to pay{" "}
        <span className="font-semibold">0.05 USDC.e</span> to{" "}
        <span className="font-semibold">user-123</span>
      </p>

      <div className="border-t border-b border-sidebar-accent mt-6 flex flex-row items-center justify-between py-2">
        <img
          src={TOKEN_INFO?.icon}
          alt={TOKEN_INFO?.name}
          className="w-10 h-10 rounded-full object-contain"
        />

        <p className="flex flex-col items-end justify-end font-semibold">
          0.05{" "}
          <span className="font-normal">
            {formatNumberUsd(convertedAmount || 0)}
          </span>
        </p>
      </div>

      <ActionButton onClick={onReceive} className="mt-10">
        Pay Now
      </ActionButton>
    </div>
  );
}
