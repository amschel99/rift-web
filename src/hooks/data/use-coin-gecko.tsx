import { useQuery } from "@tanstack/react-query";
import { WalletToken } from "@stratosphere-network/wallet";
import btclogo from "@/assets/images/logos/btc.png";
import ethlogo from "@/assets/images/logos/eth.png";
import usdclogo from "@/assets/images/logos/usdc.png";
import usdtlogo from "@/assets/images/logos/usdt.png";
import arblogo from "@/assets/images/logos/arbitrum.png";
import dailogo from "@/assets/images/logos/dai.png";
import beralogo from "@/assets/images/logos/bera.png";
import maticlogo from "@/assets/images/logos/matic.png";
import lisklogo from "@/assets/images/logos/lisk.png";
import bnblogo from "@/assets/images/logos/bnb.png";
import optimismlogo from "@/assets/images/logos/optimism.png";
import baselogo from "@/assets/images/logos/base.png";

export type cgTokens = {
  arbitrum: {
    usd: number;
  };
  binancecoin: {
    usd: number;
  };
  dai: {
    usd: 1;
  };
  ethereum: {
    usd: number;
  };
  lisk: {
    usd: number;
  };
  optimism: {
    usd: number;
  };
  tether: {
    usd: number;
  };
  [key: string]: {
    usd: number;
  };
};

async function getSupprtedTokensPrices(): Promise<cgTokens> {
  const url =
    "https://pro-api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum%2Carbitrum%2Cberachain-bera%2Cdai%2Cusd-coin%2Ctether%2Coptimism%2Cmatic-network%2Clisk%2Cbinancecoin%2Cwrapped-bitcoin";

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-pro-api-key": "CG-Whw1meTdSTTT7CSpGZbaB3Yi",
    },
  });

  return res.json();
}

const getAssetImage = (assetname: string): string => {
  return assetname == "ETH" ||
    assetname == "WETH" ||
    assetname == "WSTETH" ||
    assetname == "RETH" ||
    assetname == "CBETH"
    ? ethlogo
    : assetname == "WBTC" || assetname == "CBBTC" || assetname == "TBTC"
    ? btclogo
    : assetname == "ARB"
    ? arblogo
    : assetname == "BERA" || assetname == "WBERA"
    ? beralogo
    : assetname == "DAI"
    ? dailogo
    : assetname == "USDC" ||
      assetname == "USDC.e" ||
      assetname == "POL-USDC" ||
      assetname == "BERA-USDC"
    ? usdclogo
    : assetname == "USDT"
    ? usdtlogo
    : assetname == "OP"
    ? optimismlogo
    : assetname == "MATIC"
    ? maticlogo
    : assetname == "LSK"
    ? lisklogo
    : bnblogo;
};

const getChainLogo = (chainname: string): string => {
  return chainname == "ETHEREUM"
    ? ethlogo
    : chainname == "ARBITRUM"
    ? arblogo
    : chainname == "BERACHAIN"
    ? beralogo
    : chainname == "OPTIMISM"
    ? optimismlogo
    : chainname == "POLYGON"
    ? maticlogo
    : chainname == "LISK"
    ? lisklogo
    : chainname == "BASE"
    ? baselogo
    : bnblogo;
};

const getTokenPriceUsd = (tokenname: string, allPrices: cgTokens): number => {
  return tokenname == "ETH" ||
    tokenname == "WETH" ||
    tokenname == "WSTETH" ||
    tokenname == "RETH" ||
    tokenname == "CBETH"
    ? Number(allPrices?.ethereum?.usd)
    : tokenname == "WBTC" || tokenname == "CBBTC" || tokenname == "TBTC"
    ? Number(allPrices?.["wrapped-bitcoin"]?.usd)
    : tokenname == "ARB"
    ? Number(allPrices?.arbitrum?.usd)
    : tokenname == "BERA" || tokenname == "WBERA"
    ? Number(allPrices?.["berachain-bera"]?.usd)
    : tokenname == "DAI"
    ? Number(allPrices?.dai?.usd)
    : tokenname == "USDC" ||
      tokenname == "USDC.e" ||
      tokenname == "POL-USDC" ||
      tokenname == "BERA-USDC"
    ? Number(allPrices?.["usd-coin"]?.usd)
    : tokenname == "USDT"
    ? Number(allPrices?.tether?.usd)
    : tokenname == "OP"
    ? Number(allPrices?.optimism?.usd)
    : tokenname == "MATIC"
    ? Number(allPrices?.["matic-network"]?.usd)
    : tokenname == "LSK"
    ? Number(allPrices?.lisk?.usd)
    : Number(allPrices?.binancecoin?.usd);
};

export default function useCoinGecko() {
  const supportedtokensprices = useQuery({
    queryKey: ["allPrices"],
    queryFn: getSupprtedTokensPrices,
  });

  return {
    supportedtokensprices,
    getAssetImage,
    getChainLogo,
    getTokenPriceUsd,
  };
}
