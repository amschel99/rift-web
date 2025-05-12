import { JSX } from "react";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { useAppDrawer } from "../../hooks/drawer";
import { useSnackbar } from "../../hooks/snackbar";
import { colors } from "../../constants";
import { Copy, Telegram } from "../../assets/icons";
import "../../styles/components/drawer/sendlendlink.scss";

export const SendLendLink = (): JSX.Element => {
  const { keyToshare, secretPurpose, closeAppDrawer } = useAppDrawer(); // keyToshare->link, secretPurpose->link for crypto or web2key
  const { showsuccesssnack } = useSnackbar();

  const onCopyLink = () => {
    navigator.clipboard.writeText(keyToshare as string);
    showsuccesssnack("Link copied to clipboard...");
  };

  const onShareTg = () => {
    closeAppDrawer();
    openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(keyToshare as string)}`
    );
  };

  return (
    <div className="sendlendlink">
      <p className="sendtitle">Your link was created successfully</p>

      <p className="senddesc">Here's the link for you to share 🔗</p>

      <div className="actions">
        <button className="copylink" onClick={onCopyLink}>
          {keyToshare?.substring(0, 31) + "..."}
          <span>
            Copy
            <Copy width={12} height={14} color={colors.textsecondary} />
          </span>
        </button>

        <button onClick={onShareTg} className="tg-link">
          Share On Telegram
          <Telegram width={18} height={15} color={colors.textprimary} />
        </button>
      </div>

      <p className="mindesc">
        Please share this link with the intended receipient.
        {secretPurpose == "Key" && "You can still revoke access to this key."}
      </p>
    </div>
  );
};
