import { WalletToken } from "@stratosphere-network/wallet";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "sonner";
import useCoinGecko from "@/hooks/data/use-coin-gecko";
import useWalletAuth from "@/hooks/wallet/use-wallet-auth";


interface tokenCtrProps {
  token: WalletToken;
}

export function TokenContainer({ token }: tokenCtrProps) {
  const { userQuery } = useWalletAuth();
  const { data: CURRENT_USER } = userQuery;
  const { getAssetImage } = useCoinGecko()


  const onCopyAddress = () => {
    if (CURRENT_USER) {
      navigator.clipboard.writeText(CURRENT_USER?.user?.address as string);
      toast.success("Address copied to clipboard");
    } else {
      toast.warning("Please wait...");
    }
  };

  return (
    <div
      onClick={onCopyAddress}
      className="flex flex-row items-center justify-between bg-transparent border-1 border-border p-2 rounded-xl"
    >
      <div className="flex flex-row items-center justify-start gap-2">
        <img src={getAssetImage(token?.name)} alt="usdc" className="w-10 h-10" />
        <p className="flex flex-col text-md font-semibold">
          {token?.name}
          <span className="text-sm text-gray-500">{token?.description}</span>
        </p>
      </div>

      <button className="bg-sidebar-primary p-2 rounded-md">
        <IoCopyOutline className="w-4 h-4" />
      </button>
    </div>
  );
}
