import { JSX } from "react";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { useAppDrawer } from "../../hooks/drawer";

//TODO: incomplete
export const LendAssets = (): JSX.Element => {
  const { linkUrl } = useAppDrawer();

  const onShare = () => {
    openTelegramLink(
      `https://t.me/share/url?url=${linkUrl}&text=Claim our lending agreement`
    );
  };

  return (
    <div className="lendassets">
      <button onClick={onShare}>Send On Telegram</button>
    </div>
  );
};
