import { JSX, MouseEvent, useState } from "react";
import { useNavigate } from "react-router";

import { useSnackbar } from "../../hooks/snackbar";
import { PopOver } from "../../components/global/PopOver";
import { useBackButton } from "../../hooks/backbutton";
// import { assetType } from "../lend/CreateLendAsset"; // Removed import from deleted file

import { Copy } from "../../assets/icons/actions";
import ethlogo from "../../assets/images/eth.png";
import usdclogo from "../../assets/images/labs/usdc.png";
import beralogo from "../../assets/images/icons/bera.webp";
import "../../styles/pages/deposit/deposittoaddres.scss";

// Define network info type
type NetworkInfo = {
  name: string;
  warning: string;
  contractAddress?: string; // Added optional contract address
};

export default function DepositToAddress(): JSX.Element {
  const navigate = useNavigate();
  const { showsuccesssnack } = useSnackbar();

  // Initial state set to ETH, allowed types are WBERA, ETH, USDC
  const [depositAsset, setDepositAsset] =
    // useState<Extract<assetType, "WBERA" | "ETH" | "USDC">>("ETH"); // Use direct literal type below
    useState<"WBERA" | "ETH" | "USDC">("ETH");
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  // const btcaddress = localStorage.getItem("btcaddress") as string; // Use eth address for all
  const ethaddress = localStorage.getItem("ethaddress") as string;

  const onCopyAddr = () => {
    // if (depositAsset == "BTC") { // Use eth address for all
    //   navigator.clipboard.writeText(btcaddress);
    // } else {
    navigator.clipboard.writeText(ethaddress); // Always copy ethaddress
    // }
    showsuccesssnack("Address copied to clipboard");
  };

  const goBack = () => {
    navigate("/deposit");
  };

  // Define network information for each asset
  const getNetworkInfo = (asset: typeof depositAsset): NetworkInfo => {
    switch (asset) {
      case "WBERA":
        return {
          name: "Berachain ", // Adjust if mainnet
          warning: "Only send WBERA on the Berachain network.",
          contractAddress: "0x6969696969696969696969696969696969696969", // Added WBERA contract
        };
      case "USDC":
        return {
          name: "Polygon Mainnet",
          warning: "Only send USDC (PoS) on the Polygon Mainnet.",
          contractAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Added USDC contract
        };
      case "ETH":
      default:
        return {
          name: "Ethereum Mainnet (ERC20)",
          warning: "Only send ETH (ERC20) on the Ethereum Mainnet.",
        };
    }
  };
  const networkInfo = getNetworkInfo(depositAsset);

  const openAssetPopOver = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  useBackButton(goBack);

  return (
    <section id="" className="bg-[#0e0e0e] h-screen px-4 pb-20 overflow-y-auto">
      <p className="text-xl text-[#f6f7f9] font-bold text-center mt-8">
        Deposit {depositAsset}
      </p>
      <span className="text-sm text-gray-400 my-2 text-center block">
        Deposit {depositAsset} to your Sphere wallet
      </span>

      <p className="text-[#f6f7f9] font-bold mt-8">Choose an asset</p>
      <span className="text-sm text-gray-400 mb-4 block">
        What crypto asset would you like to deposit ?
      </span>

      <div className="mt-4" onClick={openAssetPopOver}>
        <div className="flex items-center gap-2 bg-[#222222] rounded-2xl p-2 mb-4 cursor-pointer">
          <img
            src={
              depositAsset == "WBERA"
                ? beralogo
                : depositAsset == "ETH"
                ? ethlogo
                : usdclogo // Default/USDC
            }
            className="w-10 h-10 rounded-full"
            alt="asset"
          />

          <p className="text-sm text-[#f6f7f9] font-bold">
            {depositAsset} <br />
            <span>
              {depositAsset == "WBERA"
                ? "Berachain"
                : depositAsset == "ETH"
                ? "Ethereum"
                : "USD Coin"}
            </span>
          </p>
        </div>
      </div>
      <PopOver anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
        <div className="select_assets p-2 space-y-1">
          {/* Asset Options - WBERA, ETH, USDC only */}
          <div
            className="img_desc flex items-center gap-2 p-2 hover:bg-[#2a2a2a] rounded-lg cursor-pointer"
            onClick={() => {
              setDepositAsset("WBERA");
              setAnchorEl(null);
            }}
          >
            <img src={beralogo} alt="asset" className="w-8 h-8 rounded-full" />
            <p className="desc text-sm text-[#f6f7f9]">
              WBERA <br />{" "}
              <span className="text-xs text-gray-400">Berachain</span>
            </p>
          </div>

          <div
            className="img_desc flex items-center gap-2 p-2 hover:bg-[#2a2a2a] rounded-lg cursor-pointer"
            onClick={() => {
              setDepositAsset("ETH");
              setAnchorEl(null);
            }}
          >
            <img src={ethlogo} alt="asset" className="w-8 h-8 rounded-full" />
            <p className="desc text-sm text-[#f6f7f9]">
              ETH <br /> <span className="text-xs text-gray-400">Ethereum</span>
            </p>
          </div>

          <div
            className="img_desc flex items-center gap-2 p-2 hover:bg-[#2a2a2a] rounded-lg cursor-pointer"
            onClick={() => {
              setDepositAsset("USDC");
              setAnchorEl(null);
            }}
          >
            <img src={usdclogo} alt="asset" className="w-8 h-8 rounded-full" />
            <p className="desc text-sm text-[#f6f7f9]">
              USDC <br />{" "}
              <span className="text-xs text-gray-400">USD Coin</span>
            </p>
          </div>
        </div>
      </PopOver>

      <p className="text-[#f6f7f9] font-bold mt-8 mb-2">
        Deposit Address (Network: {networkInfo.name})
      </p>
      <div
        className="flex items-center gap-2 mb-4 justify-between p-3 bg-[#222222] rounded-xl text-sm text-gray-400 w-full cursor-pointer hover:bg-[#2a2a2a]"
        onClick={onCopyAddr}
      >
        {/* Always display ethaddress */}
        <span>
          {ethaddress?.substring(0, 8) + "..." + ethaddress?.slice(-8)}
        </span>
        <span className="flex text-sm text-[#ffb386] items-center gap-1">
          Copy
          <Copy width={12} height={14} color={"#ffb386"} />
        </span>
      </div>

      {/* Network Info Section */}
      <div className="mt-4 p-4 bg-[#222222] rounded-xl border border-yellow-500/50">
        <p className="text-sm text-yellow-400 font-semibold text-center">
          Important: Network Information
        </p>
        <p className="text-sm text-gray-300 mt-2 text-center">
          {networkInfo.warning} Sending assets on the wrong network may result
          in permanent loss of funds.
        </p>
        {/* Conditionally display contract address */}
        {networkInfo.contractAddress && (
          <p className="text-xs text-gray-400 mt-2 text-center break-all">
            Ensure you are interacting with the correct token contract: <br />
            <strong className="text-gray-200">
              {networkInfo.contractAddress}
            </strong>
          </p>
        )}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Deposit only {depositAsset} to this address via the{" "}
          <strong className="text-gray-200">{networkInfo.name}</strong> network.
        </p>
      </div>
    </section>
  );
}
