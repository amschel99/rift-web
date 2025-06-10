import useOnRamp from "@/hooks/wallet/use-on-ramp";
import { FaCircleChevronRight } from "react-icons/fa6";
import { useNavigate } from "react-router";
import useWalletAuth from "@/hooks/wallet/use-wallet-auth";
import { TransactionItem } from "../history/components/TransactionItem";

export default function OnRamp() {
  const navigate = useNavigate();
  const { userQuery } = useWalletAuth();
  const { data: USER } = userQuery;

  const { onramphistory } = useOnRamp({
    externalReference: USER?.user?.externalId,
  });

  const { data: ONRAMP_HISTORY } = onramphistory;

  return (
    <div className="w-full h-full p-4">
      <div className="mt-2 mb-30">
        {ONRAMP_HISTORY?.data?.length == 0 ? (
          <p className="font-medium text-sm">
            Start buying crypto to see your purchase history here
          </p>
        ) : (
          ONRAMP_HISTORY?.data?.map((_tx_item) => (
            <TransactionItem key={_tx_item.id} isOnramp onrampitem={_tx_item} />
          ))
        )}
      </div>

      <div
        className="absolute bottom-22 left-3 right-3 flex items-center justify-between bg-accent p-4 rounded-xl"
        onClick={() => navigate("/buy-crypto")}
      >
        <p className="flex flex-col text-md font-semibold">
          Get Crypto
          <span className="text-sm text-gray-500">Buy Crypto with cash</span>
        </p>

        <FaCircleChevronRight className="text-color-text-subtle" />
      </div>
    </div>
  );
}
