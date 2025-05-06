import { JSX } from "react";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
import "../../styles/pages/lenddashoard.scss";

export default function LendToUse(): JSX.Element {
  const { switchtab } = useTabs();

  const goBack = () => {
    switchtab("home");
  };

  useBackButton(goBack);

  return (
    <section id="lenddashoard">lend dashboard (includes total earned)</section>
  );
}
