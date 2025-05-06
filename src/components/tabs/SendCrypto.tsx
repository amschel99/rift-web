import { JSX } from "react";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
import "../../styles/components/tabs/sendcrypto.scss";

// type sendcryptotype = "WBERA" | "ETH" | "USDC" | "WUSDC";

export const SendCryptoTab = (): JSX.Element => {
  const { switchtab } = useTabs();

  const goBack = () => {
    switchtab("home");
  };

  useBackButton(goBack);

  return <section id="sendcrypto">send crypto from here</section>;
};
