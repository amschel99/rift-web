import { JSX } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "@/hooks/backbutton";
import { useTabs } from "@/hooks/tabs";
import "@/styles/pages/polymarket/index.scss";

export default function Polymarket(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="polymarket">My Stats &GT; All Markets &GT; My Trades</section>
  );
}
