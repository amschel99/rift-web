import { JSX, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTabs } from "../hooks/tabs";
import { useSnackbar } from "../hooks/snackbar";
import { useBackButton } from "../hooks/backbutton";
import { cryptoassets } from "./transactions/SendCryptoMethods";
import { CurrencyPicker } from "../components/global/Radios";
import { Copy, Warning } from "../assets/icons";
import { colors } from "../constants";
import ethlogo from "../assets/images/logos/eth.png";
import beralogo from "../assets/images/logos/bera.png";
import usdclogo from "../assets/images/logos/usdc.png";
import "../styles/pages/deposit.scss";

export default function Deposit(): JSX.Element {
  const navigate = useNavigate();
  const { srccurrency } = useParams();
  const { showsuccesssnack } = useSnackbar();
  const { switchtab } = useTabs();

  const initailCurrency: cryptoassets = srccurrency as string as cryptoassets;

  const [depositAsset, setDepositAsset] =
    useState<cryptoassets>(initailCurrency);

  const ethaddress = localStorage.getItem("ethaddress") as string;
  const beraUsdcContractAddress = "0x549943e04f40284185054145c6E4e9568C1D3241";
  const polUsdcContractAddres = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

  const onCopyAddr = () => {
    navigator.clipboard.writeText(ethaddress);
    showsuccesssnack("Address copied to clipboard");
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
        <CurrencyPicker
          image={ethlogo}
          title="ETH"
          description="Ethereum Mainnet"
          ischecked={depositAsset == "ETH"}
          onclick={() => setDepositAsset("ETH")}
        />

        <CurrencyPicker
          image={beralogo}
          title="BERA"
          description="Berachain"
          ischecked={depositAsset == "WBERA"}
          onclick={() => setDepositAsset("WBERA")}
        />

        <CurrencyPicker
          image={usdclogo}
          title="USDC"
          description="Polygon Mainnet"
          ischecked={depositAsset == "USDC"}
          onclick={() => setDepositAsset("USDC")}
        />

        <CurrencyPicker
          image={usdclogo}
          title="USDC.e"
          description="Berachain"
          ischecked={depositAsset == "WUSDC"}
          onclick={() => setDepositAsset("WUSDC")}
        />
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
          <span>
            {depositAsset == "WUSDC"
              ? "USDC.e"
              : depositAsset == "WBERA"
              ? "BERA"
              : depositAsset}
          </span>
          &nbsp;to this addres on&nbsp;
          <span>
            {depositAsset == "WBERA" || depositAsset == "WUSDC"
              ? "Berachain"
              : depositAsset == "ETH"
              ? "Ethereum Mainnet"
              : "Polygon Mainnet"}
          </span>
        </p>

        {(depositAsset == "USDC" || depositAsset == "WUSDC") && (
          <div>
            <p>
              To ensure you are intercting with the correct token, please use
              this contract address&nbsp;
              <span>
                {depositAsset == "WUSDC"
                  ? beraUsdcContractAddress
                  : polUsdcContractAddres}
              </span>
            </p>

            <button>
              Copy Contract Address <Copy color={colors.textsecondary} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
