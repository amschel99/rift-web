import { JSX } from "react";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";

export const KeysTab = (): JSX.Element => {
  const { switchtab } = useTabs();

  const goBack = () => {
    switchtab("home");
  };

  useBackButton(goBack);

  return <div id="keystab">Keys tab here</div>;
};
