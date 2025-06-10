import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import useChains from "@/hooks/data/use-chains";
import { TokenContainer } from "./components/TokenContainer";
import { Input } from "@/components/ui/input";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function ReceiveCrypto() {
  const navigate = useNavigate();
  const { assetsquery } = useChains();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: SUPPORTED_ASSETS } = assetsquery;

  const filteredAssets =
    searchTerm.trim() === ""
      ? SUPPORTED_ASSETS
      : SUPPORTED_ASSETS?.filter(
        (asset) =>
          asset?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <button
        onClick={goBack}
        className="p-1 mb-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Go back"
      >
        <IoMdArrowRoundBack className="text-2xl text-primary" />
      </button>

      <p className="flex flex-col font-bold text-lg mb-4">
        Receive Crypto
        <span className="font-medium text-sm">
          Deposit Crypto to your Sphere wallet
        </span>
      </p>

      <div className="relative mb-4">
        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search for tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        {filteredAssets?.map((_asset, idx) => (
          <TokenContainer key={_asset?.name + idx} token={_asset} />
        ))}
      </div>
    </div>
  );
}
