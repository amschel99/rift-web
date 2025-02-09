import { JSX } from "react";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { useAppDrawer } from "../../hooks/drawer";
import { useSnackbar } from "../../hooks/snackbar";
import { colors } from "../../constants";
import { Copy, Telegram } from "../../assets/icons/actions";
import "../../styles/components/drawer/paymentlink.scss";

export const PaymentLink = (): JSX.Element => {
  const { closeAppDrawer, linkUrl } = useAppDrawer();
  const { showsuccesssnack } = useSnackbar();

  const onCopyLink = () => {
    navigator.clipboard.writeText(linkUrl as string);
    showsuccesssnack("Link copied to clipboard...");
  };

  const onShareTg = () => {
    closeAppDrawer();
    openTelegramLink(
      `https://t.me/share/url?url=${linkUrl}&text=Claim airdrop tokens from my campaign on StratoSphereId`
    );
  };

  return (
    <div className="sendpaylink">
      <p className="sendtitle">Your link was created successfully</p>
      <p className="senddesc">
        You can copy, share, or share it on Telegram with the other party
      </p>

      <div className="actions">
        <button className="copylink" onClick={onCopyLink}>
          {linkUrl?.substring(0, 31) + "..."}
          <span>
            Copy
            <Copy width={12} height={14} color={colors.textsecondary} />
          </span>
        </button>

        <button className="send_tg" onClick={onShareTg}>
          Share On Telegram
          <Telegram width={18} height={18} color={colors.textprimary} />
        </button>
      </div>
    </div>
  );
};
