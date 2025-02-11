import { JSX, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { backButton } from "@telegram-apps/sdk-react";
import { TextField } from "@mui/material";
import { useSnackbar } from "../../hooks/snackbar";
import { Convert as ConvertIcon } from "../../assets/icons/tabs";
import usdclogo from "../../assets/images/labs/usdc.png";
import { colors } from "../../constants";
import "../../styles/pages/assets/convert.scss";

const currencyflags = ["🇺🇸", "🇭🇰"];

export default function Convert(): JSX.Element {
  const { currency, availableamount } = useParams();
  const navigate = useNavigate();
  const { showerrorsnack } = useSnackbar();

  const [convertAmnt, setConvertAmnt] = useState<string>("");

  const onError = () => {
    return Number(convertAmnt) >= Number(availableamount) ? true : false;
  };

  const onConvertFiat = async () => {
    if (convertAmnt == "") {
      showerrorsnack("Please enter an amount...");
    } else {
      showerrorsnack("Feature coming soon");
    }
  };

  const goBack = () => {
    currency == "USD"
      ? navigate(`/usd-asset/${availableamount}`)
      : navigate(`/hkd-asset/${availableamount}`);
  };

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
      backButton.show();
    }

    if (backButton.isMounted()) {
      backButton.onClick(goBack);
    }

    return () => {
      backButton.offClick(goBack);
      backButton.unmount();
    };
  }, []);

  return (
    <section id="convert">
      <div className="conversion">
        <div className="flag_symbol">
          <span className="flag">
            {currency == "USD" ? currencyflags[0] : currencyflags[1]}
          </span>
          <p className="symbol">{currency}</p>
        </div>

        <span className="icon">
          <ConvertIcon color={colors.success} />
        </span>

        <div className="flag_symbol">
          <img className="flag" src={usdclogo} alt="usdc" />
          <p className="symbol">USDC</p>
        </div>
      </div>

      <p className="desc">
        Get USD Coin (USDC / Stablecoin) using your {currency} Airwallex
        balance. Converted amount will be added to your wallet.
      </p>

      <p className="availablebalance">
        Available:&nbsp;
        <span>
          {Number(availableamount).toFixed(2)} {currency}
        </span>
      </p>

      <div className="convertqty">
        <TextField
          label={`Amount (${currency})`}
          type="number"
          value={convertAmnt}
          onChange={(e) => setConvertAmnt(e.target.value)}
          onKeyUp={onError}
          error={onError()}
          variant="outlined"
          fullWidth
          sx={{
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

        <button
          disabled={convertAmnt == "" || onError()}
          onClick={onConvertFiat}
        >
          Convert
          <ConvertIcon
            width={12}
            height={16}
            color={
              convertAmnt == "" || onError()
                ? colors.textsecondary
                : colors.textprimary
            }
          />
        </button>
      </div>
    </section>
  );
}
