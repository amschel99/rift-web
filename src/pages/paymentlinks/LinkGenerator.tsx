import { JSX, MouseEvent, useEffect, useState } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";
import { TextField } from "@mui/material";
import { useSnackbar } from "../../hooks/snackbar";
import { useTabs } from "../../hooks/tabs";
import { useAppDrawer } from "../../hooks/drawer";
import { PopOver } from "../../components/global/PopOver";
import { colors } from "../../constants";
import { assetType } from "../lend/CreateLendAsset";
import { ChevronLeft, NFT } from "../../assets/icons/actions";
import btclogo from "../../assets/images/btc.png";
import ethlogo from "../../assets/images/eth.png";
import usdclogo from "../../assets/images/labs/usdc.png";
import "../../styles/pages/paymentlinks/linkgenerator.scss";

export default function LinkGenerator(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();
  const { showerrorsnack } = useSnackbar();
  const { openAppDrawerWithUrl } = useAppDrawer();

  const [payAsset, setPayAsset] = useState<assetType>("BTC");
  const [payAmount, setPayAmount] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const goBack = () => {
    switchtab("profile");
    navigate("/app");
  };

  const openAssetPopOver = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onGenerateLink = () => {
    if (payAmount == "") {
      showerrorsnack("Please enter an amount");
    } else {
      openAppDrawerWithUrl(
        "paymentlink",
        "https://t.me/strato_vault_bot/stratovault"
      );
    }
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
    <section id="linkgenerator">
      <p className="title">
        Payment Links
        <span>Create a link that lets others pay you seamlessly</span>
      </p>

      <p className="title_desc">
        Pick an asset
        <span>What crypto asset would you like to be paid ?</span>
      </p>

      <div className="assetselector" onClick={openAssetPopOver}>
        <div className="img_desc">
          <img
            src={
              payAsset == "BTC"
                ? btclogo
                : payAsset == "ETH"
                ? ethlogo
                : usdclogo
            }
            alt="asset"
          />

          <p className="desc">
            {payAsset} <br />
            <span>
              {payAsset == "BTC"
                ? "Bitcoin"
                : payAsset == "ETH"
                ? "Ethereum"
                : "USD Coin"}
            </span>
          </p>
        </div>

        <span className="inv_icon">
          <ChevronLeft width={6} height={11} color={colors.textsecondary} />
        </span>
      </div>
      <PopOver anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
        {
          <div className="select_assets">
            <div
              className="img_desc"
              onClick={() => {
                setPayAsset("BTC");
                setAnchorEl(null);
              }}
            >
              <img src={btclogo} alt="asset" />

              <p className="desc">
                BTC <br /> <span>Bitcoin</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setPayAsset("ETH");
                setAnchorEl(null);
              }}
            >
              <img src={ethlogo} alt="asset" />

              <p className="desc">
                ETH <br /> <span>Ethereum</span>
              </p>
            </div>

            <div
              className="img_desc"
              onClick={() => {
                setPayAsset("USDC");
                setAnchorEl(null);
              }}
            >
              <img src={usdclogo} alt="asset" />

              <p className="desc">
                USDC <br /> <span>USD Coin</span>
              </p>
            </div>

            <p className="asset_tle">
              Select an asset you would like to be paid
            </p>
          </div>
        }
      </PopOver>

      <p className="title_desc">
        Amount
        <span>Enter the amount you would like to be paid</span>
      </p>

      <TextField
        value={payAmount}
        onChange={(ev) => setPayAmount(ev.target.value)}
        label={`Amount (${payAsset})`}
        placeholder={`0.5 (${payAsset})`}
        fullWidth
        variant="outlined"
        autoComplete="off"
        type="number"
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

      <button className="gen_link" onClick={onGenerateLink}>
        Create Payment Link <NFT color={colors.textprimary} />
      </button>
    </section>
  );
}
