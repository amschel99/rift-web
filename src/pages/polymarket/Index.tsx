import { CSSProperties, JSX, ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import {
  faAnglesDown,
  faAnglesUp,
  faChartPie,
  faChartSimple,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useBackButton } from "@/hooks/backbutton";
import { useTabs } from "@/hooks/tabs";
import { formatUsd } from "@/utils/formatters";
import { SearchInput } from "@/components/global/Inputs";
import { FaIcon } from "@/assets/faicon";
import { colors } from "@/constants";
import marketimg from "@/assets/images/labs/mantracover.jpeg";
import "@/styles/pages/polymarket/index.scss";
import { SubmitButton } from "@/components/global/Buttons";

export default function Polymarket(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const [searchValue, setSearchValue] = useState<string>("");
  const [marketFilter, setMarketFilter] = useState<"all" | "me">("all");

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="polymarket">
      <div className="mystats">
        <StatsCounter
          icon={<FaIcon faIcon={faChartSimple} color={colors.textprimary} />}
          title="Markets Traded"
          value={0}
        />
        <StatsCounter
          icon={<FaIcon faIcon={faChartPie} color={colors.textprimary} />}
          title="Volume Traded"
          value={formatUsd(0)}
        />
        <StatsCounter
          icon={<FaIcon faIcon={faWaveSquare} color={colors.textprimary} />}
          title="Profit/Loss"
          value={formatUsd(0)}
        />
      </div>

      <SearchInput
        placeholder="Find Markets"
        inputState={searchValue}
        setInputState={setSearchValue}
        ctrsxstyles={{ marginTop: "0.75rem" }}
      />

      <div className="marketfilters">
        <button
          className={marketFilter == "all" ? "active" : ""}
          onClick={() => setMarketFilter("all")}
        >
          All Markets
        </button>
        <button
          className={marketFilter == "me" ? "active" : ""}
          onClick={() => setMarketFilter("me")}
        >
          My Trades
        </button>
      </div>

      {marketFilter == "all" ? (
        <div className="markets">
          <Market />
          <Market />
          <Market />
          <Market />
          <Market />
        </div>
      ) : (
        <div className="markets">
          <p className="notrades">
            Your trades will appear here once you strat trading
          </p>
        </div>
      )}
    </section>
  );
}

const StatsCounter = ({
  icon,
  title,
  value,
  onclick,
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
  onclick?: () => void;
}): JSX.Element => {
  return (
    <div className="stat_ctr" onClick={onclick}>
      <div className="icon">{icon}</div>

      <p>
        <span>{title}</span> {value}
      </p>
    </div>
  );
};

// {marketid,marketimage,markettitle,marketvolume,minshares}:
// {marketid:string,marketimage:string,markettitle:string,marketvolume:number|string,minshares:number}
const Market = (): JSX.Element => {
  const buttonstyles: CSSProperties = {
    width: "49%",
    padding: "0.5rem",
    fontWeight: "bold",
    color: colors.textprimary,
  };

  return (
    <div className="marketctr">
      <div className="img_title">
        <img src={marketimg} alt="market" />
        <p>Will Meta be forced to sell Instagram or WhatsApp in 2025 ?</p>
      </div>

      <div className="marketconditions">
        <p>
          $8K <span>Vol</span>
        </p>
        <p>
          100 <span>Min Shares</span>
        </p>
      </div>

      <div className="marketactions">
        <SubmitButton
          text="Buy Yes"
          icon={
            <FaIcon
              faIcon={faAnglesUp}
              color={colors.textprimary}
              fontsize={12}
            />
          }
          sxstyles={{ ...buttonstyles, backgroundColor: colors.accent }}
          onclick={() => {}}
        />

        <SubmitButton
          text="Buy No"
          icon={
            <FaIcon
              faIcon={faAnglesDown}
              color={colors.textprimary}
              fontsize={12}
            />
          }
          sxstyles={{ ...buttonstyles, backgroundColor: colors.danger }}
          onclick={() => {}}
        />
      </div>
    </div>
  );
};
