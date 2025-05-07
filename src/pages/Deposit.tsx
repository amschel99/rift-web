import { JSX, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import { useTabs } from "../hooks/tabs";
import { useSnackbar } from "../hooks/snackbar";
import { useBackButton } from "../hooks/backbutton";
import { colors } from "../constants";
import "../styles/pages/deposit.scss";

export default function Deposit(): JSX.Element {
  const navigate = useNavigate();
  const { srccurrency } = useParams();
  const { showsuccesssnack } = useSnackbar();
  const { switchtab } = useTabs();

  const [depositAsset, setDepositAsset] = useState<
    "ETH" | "WBERA" | "USDC" | "WUSDC"
  >("ETH");

  const ethaddress = localStorage.getItem("ethaddress") as string;
  const berausdcContractAddress = "0x549943e04f40284185054145c6E4e9568C1D3241";
  const polygonUsdcAddres = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

  const onCopyAddr = () => {
    navigator.clipboard.writeText(ethaddress);
    showsuccesssnack("Address copied to clipboard");
  };

  const goBack = () => {
    const prevpage = localStorage.getItem("prev_page");

    if (prevpage) {
      navigate(prevpage);
    } else {
      switchtab("home");
      navigate("/app");
    }
  };

  useBackButton(goBack);

  return (
    <section id="deposit">
      <p className="title_desc">
        Deposit
        <span>Use your address to receive crypto in your Sphere wallet</span>
      </p>

      <div className="selectcrypto">
        <div className="qr_ctr">
          <div className="_qr">
            <QRCodeSVG
              value={ethaddress}
              bgColor={colors.textprimary}
              fgColor={colors.primary}
              style={{ borderRadius: "0.5rem" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
