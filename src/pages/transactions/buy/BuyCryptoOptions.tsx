import { JSX } from "react";
import { useNavigate } from "react-router";
import { useTabs } from "../../../hooks/tabs";
import { useBackButton } from "../../../hooks/backbutton";

export default function BuyCryptoOptions(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return <section id="buycryptooptions">Buy crypto options</section>;
}
