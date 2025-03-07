import { JSX, useState } from "react";
import { useNavigate } from "react-router";
import { assetType } from "../lend/CreateLendAsset";
import { useBackButton } from "../../hooks/backbutton";
import { CryptoPopOver } from "../../components/global/PopOver";
import { RefreshAlt } from "../../assets/icons/actions";
import { colors } from "../../constants";
import btclogo from "../../assets/images/btc.png";
import ethlogo from "../../assets/images/eth.png";
import usdclogo from "../../assets/images/labs/usdc.png";
import wusdlogo from "../../assets/images/wusd.png";
import mantralogo from "../../assets/images/labs/mantralogo.jpeg";
import "../../styles/pages/transactions/swapcrypto.scss";
import { SubmitButton } from "../../components/global/Buttons";

export default function SwapCrypto(): JSX.Element {
  const navigate = useNavigate();

  const [sellCurrency, setSellCurrency] =
    useState<Exclude<assetType, "USD" | "HKD">>("HKDA");
  const [receiveCurrency, setReceiveCurrency] =
    useState<Exclude<assetType, "USD" | "HKD">>("USDC");
  const [sellCurrencyValue, setSellCurrencyValue] = useState<string>("");
  const [receiveCurrencyValue, setReceiveCurrencyValue] = useState<number>(0);
  const [sellCurrencyAnchorEl, setSellCurrencyAnchorEl] =
    useState<HTMLDivElement | null>(null);
  const [receiveCurrencyAnchorEl, setReceiveCurrencyAnchorEl] =
    useState<HTMLDivElement | null>(null);

  const goBack = () => {
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="swapcrypto">
      <div className="sellcurr_ctr">
        <div className="curr_balance">
          <div
            className="curr"
            onClick={(e) => setSellCurrencyAnchorEl(e.currentTarget)}
          >
            {sellCurrency == "HKDA" ? (
              <span className="currency_icon">🇭🇰</span>
            ) : (
              <img
                src={
                  sellCurrency == "OM"
                    ? mantralogo
                    : sellCurrency == "WUSD"
                    ? wusdlogo
                    : sellCurrency == "USDC"
                    ? usdclogo
                    : sellCurrency == "ETH"
                    ? ethlogo
                    : btclogo
                }
                alt={sellCurrency}
              />
            )}
            <span className="currency_name">{sellCurrency}</span>
          </div>
          <CryptoPopOver
            anchorEl={sellCurrencyAnchorEl}
            setAnchorEl={setSellCurrencyAnchorEl}
            setCurrency={setSellCurrency}
          />

          <p className="balance">
            <span>0.45</span> {sellCurrency}
          </p>
        </div>

        <div className="input_ctr">
          <input
            type="text"
            inputMode="numeric"
            placeholder={`0.0 ${sellCurrency}`}
            value={sellCurrencyValue}
            onChange={(e) => setSellCurrencyValue(e.target.value)}
          />
          <span className="sell_title">Sell</span>
          <button className="max_out">Max</button>
        </div>
      </div>

      <div className="switch_currenncy">
        <button
          onClick={() => {
            setSellCurrency(receiveCurrency);
            setReceiveCurrency(sellCurrency);
          }}
        >
          <RefreshAlt width={16} height={14} color={colors.primary} />
        </button>
      </div>

      <div className="receivecurr_ctr">
        <div
          className="curr"
          onClick={(e) => setReceiveCurrencyAnchorEl(e.currentTarget)}
        >
          {receiveCurrency == "HKDA" ? (
            <span className="currency_icon">🇭🇰</span>
          ) : (
            <img
              src={
                receiveCurrency == "OM"
                  ? mantralogo
                  : receiveCurrency == "WUSD"
                  ? wusdlogo
                  : receiveCurrency == "USDC"
                  ? usdclogo
                  : receiveCurrency == "ETH"
                  ? ethlogo
                  : btclogo
              }
              alt={receiveCurrency}
            />
          )}
          <span className="currency_name">{receiveCurrency}</span>
        </div>
        <CryptoPopOver
          anchorEl={receiveCurrencyAnchorEl}
          setAnchorEl={setReceiveCurrencyAnchorEl}
          setCurrency={setReceiveCurrency}
        />

        <div className="receive_qty">
          <p className="qty">
            {receiveCurrencyValue} <span>{receiveCurrency}</span>
          </p>
          <p className="receive_title">Receive</p>
        </div>
      </div>

      <SubmitButton
        text="Swap"
        icon={
          <RefreshAlt
            width={16}
            height={14}
            color={
              sellCurrencyValue == "" || receiveCurrencyValue == 0
                ? colors.textsecondary
                : colors.textprimary
            }
          />
        }
        sxstyles={{
          width: "unset",
          padding: "0.5rem",
          position: "fixed",
          bottom: "1rem",
          left: "1rem",
          right: "1rem",
          borderRadius: "1rem",
        }}
        isDisabled={sellCurrencyValue == "" || receiveCurrencyValue == 0}
        onclick={() => {}}
      />
    </section>
  );
}
