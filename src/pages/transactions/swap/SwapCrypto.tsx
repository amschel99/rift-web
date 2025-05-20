import { JSX, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useBackButton } from "../../../hooks/backbutton";
import { formatNumber } from "../../../utils/formatters";
import { PopOver } from "../../../components/global/PopOver";
import { RadioButtonWithIcons } from "../../../components/global/Radios";
import { networks, token } from "./NetworkPicker";
import { Gas, GasOff, Rotate } from "../../../assets/icons";
import { colors } from "../../../constants";
import btclogo from "../../../assets/images/logos/btc.png";
import ethlogo from "../../../assets/images/logos/eth.png";
import arbitrumlogo from "../../../assets/images/logos/arbitrum.png";
import optimismlogo from "../../../assets/images/logos/optimism.png";
import baselogo from "../../../assets/images/logos/base.png";
import usdclogo from "../../../assets/images/logos/usdc.png";
import tetherlogo from "../../../assets/images/logos/usdt.png";
import dailogo from "../../../assets/images/logos/dai.png";
import avaxlogo from "../../../assets/images/logos/avalanche-avax.png";
import maticlogo from "../../../assets/images/logos/matic.png";
import "../../../styles/pages/transactions/swap/swapcrypto.scss";

export default function SwapCrypto(): JSX.Element {
  const navigate = useNavigate();
  const { network } = useParams();

  const selectedNetwork = network as string as networks;
  const ethereumTokens: token[] = [
    { symbol: "ETH", logo: ethlogo },
    { symbol: "USDC", logo: usdclogo },
    { symbol: "USDT", logo: tetherlogo },
    { symbol: "WETH", logo: ethlogo },
    { symbol: "WBTC", logo: btclogo },
    { symbol: "DAI", logo: dailogo },
    { symbol: "WSTETH", logo: ethlogo },
    { symbol: "RETH", logo: ethlogo },
  ];
  const arbitrumTokens: token[] = [
    { symbol: "ARB", logo: arbitrumlogo },
    { symbol: "ETH", logo: ethlogo },
    { symbol: "USDC", logo: usdclogo },
    { symbol: "USDT", logo: tetherlogo },
    { symbol: "WETH", logo: ethlogo },
    { symbol: "WBTC", logo: btclogo },
    { symbol: "DAI", logo: dailogo },
    { symbol: "WSTETH", logo: ethlogo },
    { symbol: "RETH", logo: ethlogo },
    { symbol: "WAVAX", logo: avaxlogo },
    { symbol: "WMATIC", logo: maticlogo },
  ];
  const optimisimToken: token[] = [
    { symbol: "ETH", logo: ethlogo },
    { symbol: "WETH", logo: ethlogo },
    { symbol: "OP", logo: optimismlogo },
    { symbol: "WBTC", logo: btclogo },
    { symbol: "USDC", logo: usdclogo },
    { symbol: "USDT", logo: tetherlogo },
    { symbol: "DAI", logo: dailogo },
    { symbol: "WSTETH", logo: ethlogo },
  ];
  const baseTokes: token[] = [
    { symbol: "ETH", logo: ethlogo },
    { symbol: "WETH", logo: ethlogo },
    { symbol: "CBBTC", logo: btclogo },
    { symbol: "TBTC", logo: btclogo },
    { symbol: "USDC", logo: usdclogo },
    { symbol: "USDT", logo: tetherlogo },
    { symbol: "DAI", logo: dailogo },
    { symbol: "CBETH", logo: ethlogo },
    { symbol: "WSTETH", logo: ethlogo },
  ];

  const selectedTokens: token[] =
    selectedNetwork == "ETHEREUM"
      ? ethereumTokens
      : selectedNetwork == "ARBITRUM"
      ? arbitrumTokens
      : selectedNetwork == "OPTIMISM"
      ? optimisimToken
      : baseTokes;
  const initialSellToken = selectedTokens[0];
  const initialReceiveToken = selectedTokens[0];

  const [sellCurrency, setSellCurrency] = useState<token>(initialSellToken);
  const [receiveCurrency, setReceiveCurrency] =
    useState<token>(initialReceiveToken);
  const [sellCurrencyValue, setSellCurrencyValue] = useState<string>("");
  const [receiveCurrencyValue, setReceiveCurrencyValue] = useState<number>(0);
  const [swapType, setSwapType] = useState<"NORMAL" | "GASLESS">("NORMAL");
  const [sellCurrAnchorEl, setSellCurrAnchorEl] =
    useState<HTMLDivElement | null>(null);
  const [receiveCurrAnchorEl, setReceiveCurrAnchorEl] =
    useState<HTMLDivElement | null>(null);

  const onSwitchCurency = () => {
    setSellCurrency(receiveCurrency);
    setReceiveCurrency(sellCurrency);
  };

  const goBack = () => {
    navigate("/swap-network");
  };

  useBackButton(goBack);

  return (
    <section id="swapcrypto">
      <div className="network">
        <img
          src={
            selectedNetwork == "ETHEREUM"
              ? ethlogo
              : selectedNetwork == "ARBITRUM"
              ? arbitrumlogo
              : selectedNetwork == "OPTIMISM"
              ? optimismlogo
              : baselogo
          }
          alt="network"
        />

        <p>
          Swapping on&nbsp;
          <span>
            {selectedNetwork == "ETHEREUM"
              ? "Ethereum Mainnet"
              : selectedNetwork}
          </span>
        </p>
      </div>

      <div className="sellcurr_ctr">
        <div className="curr_balance">
          <div
            className="curr"
            onClick={(e) => setSellCurrAnchorEl(e.currentTarget)}
          >
            <img src={sellCurrency.logo} alt={sellCurrency.symbol} />

            <span className="currency_name">{sellCurrency.symbol}</span>
          </div>
          <PopOver
            anchorEl={sellCurrAnchorEl}
            setAnchorEl={setSellCurrAnchorEl}
          >
            <div className="sell-receive-tokens-ctr">
              {selectedTokens?.map((_token) => (
                <div
                  onClick={() => {
                    setSellCurrency(_token);
                    setSellCurrAnchorEl(null);
                  }}
                >
                  <img src={_token?.logo} alt={_token?.symbol} />

                  <span>{_token?.symbol}</span>
                </div>
              ))}
            </div>
          </PopOver>
        </div>

        <div className="input_ctr">
          <input
            type="text"
            inputMode="numeric"
            placeholder={`0.0 ${sellCurrency.symbol}`}
            autoFocus
            value={sellCurrencyValue}
            onChange={(e) => setSellCurrencyValue(e.target.value)}
          />
          <span className="sell_title">Sell</span>
        </div>
      </div>

      <div key={sellCurrency.symbol} className="switch_currenncy">
        <button onClick={onSwitchCurency}>
          <Rotate color={colors.primary} />
        </button>
      </div>

      <div className="receivecurr_ctr">
        <div
          className="curr"
          onClick={(e) => setReceiveCurrAnchorEl(e.currentTarget)}
        >
          <img src={receiveCurrency.logo} alt={receiveCurrency.symbol} />

          <span className="currency_name">{receiveCurrency.symbol}</span>
        </div>
        <PopOver
          anchorEl={receiveCurrAnchorEl}
          setAnchorEl={setReceiveCurrAnchorEl}
        >
          <div className="sell-receive-tokens-ctr">
            {selectedTokens?.map((_token) => (
              <div
                onClick={() => {
                  setReceiveCurrency(_token);
                  setReceiveCurrAnchorEl(null);
                }}
              >
                <img src={_token?.logo} alt={_token?.symbol} />

                <span>{_token?.symbol}</span>
              </div>
            ))}
          </div>
        </PopOver>

        <div className="receive_qty">
          <p className="qty">
            {formatNumber(receiveCurrencyValue)}{" "}
            <span>{receiveCurrency.symbol}</span>
          </p>
          <p className="receive_title">Receive</p>
        </div>
      </div>

      <div className="tx-type">
        <RadioButtonWithIcons
          icon={<Gas width={20} height={20} color={colors.textprimary} />}
          isRadio
          title="Normal Swap"
          description="You'll have to incurr gas fees"
          ischecked={swapType == "NORMAL"}
          onclick={() => setSwapType("NORMAL")}
        />

        <RadioButtonWithIcons
          icon={<GasOff width={20} height={20} color={colors.textprimary} />}
          isRadio
          title="Gasless Swap"
          description="We will cover gas for you"
          ischecked={swapType == "GASLESS"}
          onclick={() => setSwapType("GASLESS")}
        />
      </div>

      <button
        className="submit-swap"
        disabled={sellCurrencyValue == "" || receiveCurrencyValue == 0}
      >
        Swap <Rotate color={colors.textprimary} />
      </button>
    </section>
  );
}
