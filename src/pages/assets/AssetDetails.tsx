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

export default function AssetDetails(): JSX.Element {
  const navigate = useNavigate();
  const { geckoid, network, symbol, balance } = useParams();
  const { switchtab } = useTabs();

  const { data: tokenInfo, isFetching: tokeninfofetching } = useQuery({
    queryKey: ["tokeninfo"],
    queryFn: () => fetchCoinInfo(geckoid as string),
  });

  const { data: tokenPrices, isFetching: pricesfetching } = useQuery({
    queryKey: ["tokenprices"],
    queryFn: () => fetchCoinPrices(geckoid as string, 30),
  });

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="assetdetails">
      <div className="token">
        <div className="img_name_symbol">
          <img src={tokenInfo?.image?.large} alt="ETH" />
          <p>
            <span>{symbol}</span>
            {network}
          </p>
        </div>

        <p className="price_change">
          ${tokenInfo?.market_data?.current_price?.usd}
          <span
            className={
              Number(tokenInfo?.market_data?.price_change_percentage_24h) > 1 ||
              Number(tokenInfo?.market_data?.price_change_percentage_24h) == 0
                ? "positive"
                : "negative"
            }
          >
            {(Number(tokenInfo?.market_data?.price_change_percentage_24h) > 1 ||
              Number(tokenInfo?.market_data?.price_change_percentage_24h) ==
                0) &&
              "+"}
            {tokenInfo?.market_data?.price_change_percentage_24h}%
          </span>
        </p>
      </div>

      <YourAssetBalance
        balance={Number(balance)}
        balanceUsd={
          Number(balance) * Number(tokenInfo?.market_data?.current_price?.usd)
        }
      />

      {!pricesfetching && !tokeninfofetching && tokenPrices && (
        <CoinPriceChart data={tokenPrices} />
      )}

      {!pricesfetching && (
        <p className="pice-desc">
          <Question width={12} height={12} color={colors.textsecondary} />
          Prices for the last 30 days
        </p>
      )}

      <p className="tokendesc">{tokenInfo?.description?.en}</p>

      <div className="token_stats">
        <p>
          Market cap Rank <span>#{tokenInfo?.market_cap_rank}</span>
        </p>
        <p>
          Market Cap
          <span>
            ${numberFormat(Number(tokenInfo?.market_data?.market_cap?.usd))}
          </span>
        </p>
        <p>
          Circulating Supply
          <span>
            {numberFormat(Number(tokenInfo?.market_data?.circulating_supply))}
          </span>
        </p>
        <p>
          Total Supply
          <span>
            {tokenInfo?.market_data?.total_supply
              ? numberFormat(Number(tokenInfo?.market_data?.total_supply))
              : "- - -"}
          </span>
        </p>
        <p>
          Max Supply
          <span>
            {tokenInfo?.market_data?.max_supply
              ? numberFormat(Number(tokenInfo?.market_data?.max_supply))
              : "- - -"}
          </span>
        </p>
      </div>
    </section>
  );
}
