import { JSX, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useTabs } from "../hooks/tabs";
import { useBackButton } from "../hooks/backbutton";
import { getSupportedAssets } from "../utils/api/wallet";
import { Search as SearchIcon } from "../assets/icons";
import { colors } from "../constants";
import "../styles/pages/search.scss";

/**
 * 
 *  | "base"
    | "lisk"
    | "bnb"
    | "berachain"
    | "polygon"
    | "ethereum"
    | "arbitrum"
 */

export default function Search(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const [searchValue, setSearchValue] = useState<string>("");
  const [tokensTypeFilter, setTokensTypeFilter] = useState<
    "native" | "stable" | "wrapped" | null
  >(null);

  const { data } = useQuery({
    queryKey: ["assets"],
    queryFn: getSupportedAssets,
  });

  const onFilterTokensType = (filter: "native" | "stable" | "wrapped") => {
    if (tokensTypeFilter == filter) {
      setTokensTypeFilter(null);
    } else {
      setTokensTypeFilter(filter);
    }
  };

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  console.log(data);

  useBackButton(goBack);

  return (
    <section id="search">
      <div className="search-input">
        <SearchIcon width={18} height={18} color={colors.textsecondary} />
        <input
          type="text"
          autoFocus
          placeholder="ETH, WBERA, USDC"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="filters">
        <button
          onClick={() => onFilterTokensType("native")}
          className={tokensTypeFilter == "native" ? "active" : ""}
        >
          Native Tokens
        </button>

        <button
          onClick={() => onFilterTokensType("stable")}
          className={tokensTypeFilter == "stable" ? "active" : ""}
        >
          Stablecoins
        </button>
        <button
          onClick={() => onFilterTokensType("wrapped")}
          className={tokensTypeFilter == "wrapped" ? "active" : ""}
        >
          Wrapped
        </button>
      </div>
    </section>
  );
}
