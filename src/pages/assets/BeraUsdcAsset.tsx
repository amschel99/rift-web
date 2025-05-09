import { JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
import { fetchCoinInfo, fetchCoinPrices } from "../../utils/coingecko/markets";
import { numberFormat } from "../../utils/formatters";
import { YourAssetBalance } from "../../components/WalletBalance";
import { CoinPriceChart } from "../../components/PriceChart";
import { Question, ArrowUpCircle, ArrowDownCircle } from "../../assets/icons";
import { colors } from "../../constants";
import "../../styles/pages/assets/assets.scss";

export default function BeraUsdcAsset(): JSX.Element {
  const navigate = useNavigate();
  const { intent } = useParams();
  const { switchtab } = useTabs();

  const { data: usdcInfo } = useQuery({
    queryKey: ["usdcinfo"],
    queryFn: () => fetchCoinInfo("usd-coin"),
  });

  const { data: usdcprices, isPending: pricesfetching } = useQuery({
    queryKey: ["usdcprices"],
    queryFn: () => fetchCoinPrices("usd-coin", 30),
  });

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  const beraUsdcbal = localStorage.getItem("berausdcbal");
  const beraUsdcUsdbal =
    Number(beraUsdcbal) * Number(usdcInfo?.market_data?.current_price?.usd);

  const onSendBeraUsdc = () => {
    localStorage.setItem("prev_page", `/bera-usdc-asset/${intent}`);
    navigate(`/send-crypto-methods/WUSDC/${intent}`);
  };

  const onDepositBeraUsdc = () => {
    localStorage.setItem("prev_page", `/bera-usdc-asset/${intent}`);
    navigate("/deposit/WUSDC");
  };

  useBackButton(goBack);

  return (
    <section id="assetdetails">
      <div className="token">
        <div className="img_name_symbol">
          <img src={usdcInfo?.image?.large} alt="ETH" />
          <p>
            USDC (Berachain) <span className="bera-usdc-symbol">USDC.e</span>
          </p>
        </div>

        <p className="price_change">
          ${usdcInfo?.market_data?.current_price?.usd}
          <span
            className={
              Number(usdcInfo?.market_data?.price_change_percentage_24h) > 1 ||
              Number(usdcInfo?.market_data?.price_change_percentage_24h) == 0
                ? "positive"
                : "negative"
            }
          >
            {(Number(usdcInfo?.market_data?.price_change_percentage_24h) > 1 ||
              Number(usdcInfo?.market_data?.price_change_percentage_24h) ==
                0) &&
              "+"}
            {usdcInfo?.market_data?.price_change_percentage_24h}%
          </span>
        </p>
      </div>

      <YourAssetBalance
        balance={Number(beraUsdcbal)}
        balanceUsd={Number(beraUsdcUsdbal)}
      />

      {usdcprices && <CoinPriceChart data={usdcprices} />}
      {!pricesfetching && (
        <p className="pice-desc">
          <Question width={12} height={12} color={colors.textsecondary} />
          Prices for the last 30 days
        </p>
      )}

      <p className="tokendesc">{usdcInfo?.description?.en}</p>

      <div className="token_stats">
        <p>
          Market cap Rank <span>#{usdcInfo?.market_cap_rank}</span>
        </p>
        <p>
          Market Cap{" "}
          <span>
            ${numberFormat(Number(usdcInfo?.market_data?.market_cap?.usd))}
          </span>
        </p>
        <p>
          Circulating Supply
          <span>
            {numberFormat(Number(usdcInfo?.market_data?.circulating_supply))}
          </span>
        </p>
        <p>
          Total Supply
          <span>
            {usdcInfo?.market_data?.total_supply
              ? numberFormat(Number(usdcInfo?.market_data?.total_supply))
              : "- - -"}
          </span>
        </p>
        <p>
          Max Supply
          <span>
            {usdcInfo?.market_data?.max_supply
              ? numberFormat(Number(usdcInfo?.market_data?.max_supply))
              : "- - -"}
          </span>
        </p>
      </div>

      <div className="assetactions">
        <button onClick={onSendBeraUsdc}>
          Send <ArrowUpCircle color={colors.textprimary} />
        </button>
        <button onClick={onDepositBeraUsdc}>
          Deposit <ArrowDownCircle color={colors.textprimary} />
        </button>
      </div>
    </section>
  );
}
