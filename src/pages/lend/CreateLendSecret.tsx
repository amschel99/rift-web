import { JSX } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import "../../styles/pages/createlendsecret.scss";

export type secretType = "POE" | "OPENAI" | "AIRWALLEX" | "POLYMARKET";
export type RepaymentAssetType = "WBERA" | "ETH" | "WUSDC" | "USDC";

export default function CreateLendSecret(): JSX.Element {
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="createlendsecret">Lend your open ai keys for now here</section>
  );
}
