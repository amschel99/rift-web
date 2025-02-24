import { JSX, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { backButton } from "@telegram-apps/sdk-react";
import { useTabs } from "../../hooks/tabs";
import { fetchCoins } from "../../utils/api/market";
import { Coins } from "./defi/Coins";
import "../../styles/components/tabs/defitab.scss";
import { coinType } from "../../types/earn";

export const DefiTab = (): JSX.Element => {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const { data, isLoading } = useQuery({
    queryKey: ["coins"],
    queryFn: fetchCoins,
    refetchInterval: 3000,
  });

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
      backButton.show();
    }

    if (backButton.isVisible()) {
      backButton.onClick(goBack);
    }

    return () => {
      backButton.offClick(goBack);
      backButton.unmount();
    };
  }, []);

  return (
    <section id="defitab">
      <Coins coinsLoading={isLoading} coinsdata={data as coinType[]} />
    </section>
  );
};
