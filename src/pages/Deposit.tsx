import { JSX, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useTabs } from "../hooks/tabs";
import { useSnackbar } from "../hooks/snackbar";
import { useBackButton } from "../hooks/backbutton";
import {
  getAllBalances,
  supportedchains,
  supportedtokens,
} from "../utils/api/balances";
import { CurrencyPicker } from "../components/global/Radios";
import { Copy, Warning } from "../assets/icons";
import { colors } from "../constants";
import btclogo from "../assets/images/logos/btc.png";
import ethlogo from "../assets/images/logos/eth.png";
import usdclogo from "../assets/images/logos/usdc.png";
import usdtlogo from "../assets/images/logos/usdt.png";
import arblogo from "../assets/images/logos/arbitrum.png";
import dailogo from "../assets/images/logos/dai.png";
import beralogo from "../assets/images/logos/bera.png";
import maticlogo from "../assets/images/logos/matic.png";
import lisklogo from "../assets/images/logos/lisk.png";
import bnblogo from "../assets/images/logos/bnb.png";
import optimismlogo from "../assets/images/logos/optimism.png";
import "../styles/pages/deposit.scss";

export default function Deposit(): JSX.Element {
  const navigate = useNavigate();
  const { srccurrency } = useParams();
  const { showsuccesssnack } = useSnackbar();
  const { switchtab } = useTabs();

  const initailCurrency: supportedtokens =
    srccurrency as string as supportedtokens;

  const [depositAsset, setDepositAsset] =
    useState<supportedtokens>(initailCurrency);
  const [selectedChain, setSelectedChain] =
    useState<supportedchains>("ETHEREUM");

  const ethaddress = localStorage.getItem("ethaddress") as string;
  const beraUsdcContractAddress = "0x549943e04f40284185054145c6E4e9568C1D3241";
  const polUsdcContractAddres = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

  const { data: allbalances, isPending: balancesloading } = useQuery({
    queryKey: ["allbalances"],
    queryFn: getAllBalances,
  });
  const combinedAssets = Object.values(allbalances?.data || []).flat();

  const onCopyAddr = () => {
    navigator.clipboard.writeText(ethaddress);
    showsuccesssnack("Address copied to clipboard");
  };

  const onCopyContractAddr = () => {
    navigator.clipboard.writeText(
      depositAsset == "USDC.e" ? beraUsdcContractAddress : polUsdcContractAddres
    );
    showsuccesssnack("Contract address copied to clipboard");
  };

  const goBack = () => {
    const prevpage = localStorage.getItem("prev_page");

    if (prevpage == null) {
      switchtab("home");
      navigate("/app");
    } else {
      navigate(prevpage);
    }
  };

  useBackButton(goBack);

  return (
    <section id="deposit">
      <p className="title_desc">
        Deposit
        <span>Use your address to receive crypto in your Sphere wallet</span>
      </p>
      <div className="currencies">
        {combinedAssets?.map((asset) => (
          <CurrencyPicker
            image={
              asset?.symbol == "ETH" ||
              asset?.symbol == "WETH" ||
              asset?.symbol == "WSTETH" ||
              asset?.symbol == "RETH" ||
              asset?.symbol == "CBETH"
                ? ethlogo
                : asset?.symbol == "WBTC" ||
                  asset?.symbol == "CBBTC" ||
                  asset?.symbol == "TBTC"
                ? btclogo
                : asset?.symbol == "ARB"
                ? arblogo
                : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                ? beralogo
                : asset?.symbol == "DAI"
                ? dailogo
                : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                ? usdclogo
                : asset?.symbol == "USDT"
                ? usdtlogo
                : asset?.symbol == "OP"
                ? optimismlogo
                : asset?.symbol == "MATIC"
                ? maticlogo
                : asset?.symbol == "LSK"
                ? lisklogo
                : bnblogo
            }
            title={asset?.symbol}
            description={asset?.chain}
            ischecked={
              depositAsset == asset?.symbol && selectedChain == asset?.chain
            }
            onclick={() => {
              setDepositAsset(asset?.symbol);
              setSelectedChain(asset?.chain);
            }}
          />
        ))}
      </div>

      <div className="txtaddress">
        <span>{ethaddress.substring(0, ethaddress.length / 2)}...</span>
        <button onClick={onCopyAddr}>
          Copy <Copy color={colors.textsecondary} />
        </button>
      </div>

      <div className="contractnotes">
        <Warning color={colors.textsecondary} />

        <p className="network">
          Only send&nbsp;
          <span>{depositAsset}</span>
          &nbsp;to this addres on&nbsp;
          <span>{selectedChain}</span>
        </p>

        {(depositAsset == "USDC" || depositAsset == "USDC.e") && (
          <div>
            <p>
              To ensure you are intercting with the correct token, please use
              this contract address&nbsp;
              <span>
                {depositAsset == "USDC.e"
                  ? beraUsdcContractAddress
                  : polUsdcContractAddres}
              </span>
            </p>

            <button onClick={onCopyContractAddr}>
              Copy Contract Address <Copy color={colors.textsecondary} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
