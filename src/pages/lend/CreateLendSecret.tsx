import { JSX, MouseEvent, useEffect, useState } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate, useParams } from "react-router";
import { TextField } from "@mui/material";
import { PopOver } from "../../components/global/PopOver";
import { formatUsd } from "../../utils/formatters";
import { colors } from "../../constants";
import { assetType } from "./CreateLendAsset";
import { ChevronLeft, Import } from "../../assets/icons/actions";
import poelogo from "../../assets/images/icons/poe.png";
import stratosphere from "../../assets/images/sphere.jpg";
import awxlogo from "../../assets/images/awx.png";
import btclogo from "../../assets/images/btc.png";
import ethlogo from "../../assets/images/eth.png";
import usdclogo from "../../assets/images/labs/usdc.png";
import "../../styles/pages/createlendsecret.scss";

export type secretType = "POE" | "SPHERE" | "AIRWALLEX";

export default function CreateLendSecret(): JSX.Element {
  const navigate = useNavigate();
  const { type } = useParams();
  const defaultSecretType = type as secretType;

  const [secretReceipient, setSecretReceipient] = useState<string>("");
  const [selSecretType, setSelSecretType] =
    useState<secretType>(defaultSecretType);
  const [secretFee, setSecretFee] = useState<string>("1");
  const [customFee, setCustomFee] = useState<string>("");
  const [anchorEl, setanchorEl] = useState<HTMLDivElement | null>(null);
  const [repayAsset, setRepayAsset] = useState<assetType>("HKD");
  const [repaymentAnchorEl, setRepaymentAnchorEl] =
    useState<HTMLDivElement | null>(null);

  let ethAddr = localStorage.getItem("address");
  let btcAddr = localStorage.getItem("btcaddress");
  let sphereId = `${ethAddr?.substring(2, 6)}${btcAddr?.substring(2, 6)}`;

  const openPopOver = (event: MouseEvent<HTMLDivElement>) => {
    setanchorEl(event.currentTarget);
  };

  const openRepaymentPopOver = (event: MouseEvent<HTMLDivElement>) => {
    setRepaymentAnchorEl(event.currentTarget);
  };

  const goBack = () => {
    navigate("/lend");
  };

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
      backButton.show();
    }

    if (backButton.isVisible()) {
      backButton.onClick(goBack);
    }

    return () => {
      backButton.offClick(goBack);
      backButton.unmount();
    };
  }, []);

  return (
    <section id="createlendsecret">
      <p className="title">
        Lend Secrets <br />
        <span>Let others use your secrets at a fee</span>
      </p>

      <div className="secretselector" onClick={openPopOver}>
        <div className="img_desc">
          <img
            src={
              selSecretType == "POE"
                ? poelogo
                : selSecretType == "SPHERE"
                ? stratosphere
                : awxlogo
            }
            alt="secret"
          />

          <p className="desc">
            {selSecretType} <br />
            <span>
              {selSecretType == "POE"
                ? "L9P0..."
                : selSecretType == "SPHERE"
                ? `${sphereId.substring(0, 4)}...`
                : "76Yh..."}
            </span>
          </p>
        </div>

        <span className="inv_icon">
          <ChevronLeft width={6} height={11} color={colors.textsecondary} />
        </span>
      </div>
      <PopOver anchorEl={anchorEl} setAnchorEl={setanchorEl}>
        {
          <div className="select_secrets">
            <div
              className="img_desc"
              onClick={() => {
                setSelSecretType("POE");
                setanchorEl(null);
              }}
            >
              <img src={poelogo} alt="secret" />

              <p className="desc">
                POE <br /> <span>L9P0...</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setSelSecretType("SPHERE");
                setanchorEl(null);
              }}
            >
              <img src={stratosphere} alt="secret" />

              <p className="desc">
                Sphere ID <br /> <span>{sphereId.substring(0, 4)}...</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setSelSecretType("AIRWALLEX");
                setanchorEl(null);
              }}
            >
              <img src={awxlogo} alt="secret" />

              <p className="desc">
                Airwallex <br /> <span>76Yh...</span>
              </p>
            </div>

            <p className="asset_tle">
              Select the secret you would like to lend
            </p>
          </div>
        }
      </PopOver>

      <div className="receipient">
        <p className="ttle">
          Receipient <br />
          <span>You can use their Telegram username</span>
        </p>

        <TextField
          value={secretReceipient}
          onChange={(ev) => setSecretReceipient(ev.target.value)}
          label="Receipient"
          placeholder="telegram username"
          fullWidth
          variant="outlined"
          autoComplete="off"
          type="text"
          sx={{
            marginTop: "0.75rem",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.divider,
              },
              "& input": {
                color: colors.textprimary,
              },
              "&::placeholder": {
                color: colors.textsecondary,
                opacity: 1,
              },
            },
            "& .MuiInputLabel-root": {
              color: colors.textsecondary,
              fontSize: "0.875rem",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: colors.accent,
            },
          }}
        />
      </div>

      <div className="receipient fees">
        <p className="ttle">
          Fee <br />
          <span>How much do you want to charge for the secret ?</span>
        </p>

        <div className="qfees">
          <button
            onClick={() => setSecretFee("0")}
            style={{
              backgroundColor: Number(secretFee) == 0 ? colors.accent : "",
            }}
          >
            {formatUsd(0)} (Free)
          </button>
          <button
            onClick={() => setSecretFee("1")}
            style={{
              backgroundColor: Number(secretFee) == 1 ? colors.accent : "",
            }}
          >
            {formatUsd(1)}
          </button>
          <button
            onClick={() => setSecretFee("12")}
            style={{
              backgroundColor: Number(secretFee) == 12 ? colors.accent : "",
            }}
          >
            {formatUsd(12)}
          </button>
          <button
            onClick={() => setSecretFee("18")}
            style={{
              backgroundColor: Number(secretFee) == 18 ? colors.accent : "",
            }}
          >
            {formatUsd(18)}
          </button>
        </div>

        <p className="ttle customfeetle">
          Custom Fee <br />
          <span>Set a custom fee for the secret</span>
        </p>

        <TextField
          value={customFee}
          onChange={(ev) => setCustomFee(ev.target.value)}
          label="Custom fee"
          placeholder="custom secret fee"
          fullWidth
          variant="outlined"
          autoComplete="off"
          type="number"
          sx={{
            marginTop: "0.875rem",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.divider,
              },
              "& input": {
                color: colors.textprimary,
              },
              "&::placeholder": {
                color: colors.textsecondary,
                opacity: 1,
              },
            },
            "& .MuiInputLabel-root": {
              color: colors.textsecondary,
              fontSize: "0.875rem",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: colors.accent,
            },
          }}
        />

        <p className="feeem">
          The receipient will pay&nbsp;
          <span>
            {customFee !== ""
              ? formatUsd(Number(customFee))
              : formatUsd(Number(secretFee))}
          </span>{" "}
          to use the secret
        </p>
      </div>

      <p className="repayment_tle">
        Payment Options
        <span>How do you wish to be paid for this secret ?</span>
      </p>
      <div
        className="repayment_curreny secretselector"
        onClick={secretFee == "0" ? () => {} : openRepaymentPopOver}
      >
        <div className="img_desc">
          {repayAsset == "HKD" || repayAsset == "USD" ? (
            <span className="country_flag">
              {repayAsset == "HKD" ? "🇭🇰" : "🇺🇸"}
            </span>
          ) : (
            <img
              src={
                repayAsset == "BTC"
                  ? btclogo
                  : repayAsset == "ETH"
                  ? ethlogo
                  : usdclogo
              }
              alt="secret"
            />
          )}

          <p className="desc">{repayAsset}</p>
        </div>

        <span className="inv_icon">
          <ChevronLeft width={6} height={11} color={colors.textsecondary} />
        </span>
      </div>
      <PopOver anchorEl={repaymentAnchorEl} setAnchorEl={setRepaymentAnchorEl}>
        {
          <div className="select_secrets">
            <div
              className="img_desc"
              onClick={() => {
                setRepayAsset("HKD");
                setRepaymentAnchorEl(null);
              }}
            >
              <span className="_icons">🇭🇰</span>

              <p className="desc">
                HKD <br /> <span>Fiat</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setRepayAsset("USD");
                setRepaymentAnchorEl(null);
              }}
            >
              <span className="_icons">🇺🇸</span>

              <p className="desc">
                USD <br /> <span>Fiat</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setRepayAsset("USDC");
                setRepaymentAnchorEl(null);
              }}
            >
              <img src={usdclogo} alt="secret" />

              <p className="desc">
                USDC <br /> <span>Crypto (Stablecoin)</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setRepayAsset("ETH");
                setRepaymentAnchorEl(null);
              }}
            >
              <img src={ethlogo} alt="secret" />

              <p className="desc">
                ETH <br /> <span>Crypto</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setRepayAsset("BTC");
                setRepaymentAnchorEl(null);
              }}
            >
              <img src={btclogo} alt="secret" />

              <p className="desc">
                BTC <br /> <span>Crypto</span>
              </p>
            </div>
          </div>
        }
      </PopOver>

      <button className="submit" onClick={goBack}>
        Lend Secret <Import width={16} height={16} color={colors.textprimary} />
      </button>
    </section>
  );
}
