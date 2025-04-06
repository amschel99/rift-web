import { JSX, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  faLayerGroup,
  faCheckCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import { stakeproducttype } from "../../types/earn";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
import { getPstTokens } from "../../utils/api/quvault/psttokens";
import { getLaunchPadStores } from "../../utils/api/quvault/launchpad";
import { getMyDividends } from "../../utils/api/quvault/dividends";
import { getStakingInfo, getStakeingBalance } from "../../utils/api/staking";
import { formatUsd, formatUsdSimple } from "../../utils/formatters";

import { Loading } from "../../assets/animations";
import { FaIcon } from "../../assets/faicon";
import { colors } from "../../constants";
import stakeicon from "../../assets/images/icons/lendto.png";
import "../../styles/components/tabs/defitab.scss";

interface sphereVaultType {
  id: string;
  name: string;
  strategy: string;
  apy: string;
  currentTvl: string;
  maxCapacity: string;
  network: string;
  lockPeriod: string;
}

type ammPoolType = {
  name: string;
  apy: number;
  hasMonthlyDividend: boolean;
  minDeposit: number | null;
  minLockPeriod: number | null;
  popularity: number;
  lockPeriod?: string;
};

type AssetType = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  balanceUsd: number;
  image: string;
  type: "staking" | "token" | "dividend" | "launchpad" | "amm";
  apy?: string | number;
  link: string;
  network?: string;
};

export const DefiTab = (): JSX.Element => {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const { data: mydividends, isFetching: dividendsloading } = useQuery({
    queryKey: ["mydividends"],
    queryFn: getMyDividends,
  });

  const { data: pstTokensdata, isFetching: pstLoading } = useQuery({
    queryKey: ["psttokens"],
    queryFn: getPstTokens,
  });

  const { data: launchPaddata, isFetching: launchpadLoading } = useQuery({
    queryKey: ["launchpad"],
    queryFn: getLaunchPadStores,
  });

  const { data: stakinginfo, isFetching: stakinginfoloading } = useQuery({
    queryKey: ["stakinginfo"],
    queryFn: getStakingInfo,
  });

  const { data: stakingbalance, isFetching: stakingbalanceloading } = useQuery({
    queryKey: ["stkingbalance"],
    queryFn: getStakeingBalance,
  });

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  const lstUsdValue = (
    treasuryvalue: number,
    totalstaked: number,
    stakedamount: number
  ): number => {
    const profit = 1 - treasuryvalue / totalstaked;
    const usdvalue = profit / 100 + stakedamount;
    return usdvalue;
  };

  // Combine all assets into a unified list
  const portfolioAssets = useMemo(() => {
    const assets: AssetType[] = [];

    // Add staking assets
    if (stakingbalance?.data) {
      const buffetLstValue = lstUsdValue(
        Number(stakinginfo?.data?.treasuryValue || 0),
        Number(stakinginfo?.data?.totalStaked || 0),
        Number(stakingbalance?.data?.lstBalance || 0)
      );

      assets.push({
        id: "buffet",
        name: "Sphere Vault",
        symbol: "SPHERE",
        balance: Number(stakingbalance?.data?.lstBalance) || 0,
        balanceUsd: buffetLstValue,
        image: stakeicon,
        type: "staking",
        apy: "11-13% Guaranteed",
        link: "/stakevault/buffet",
        network: "Polygon",
      });

      // Add other staking assets (placeholder values)
      // assets.push({
      //   id: "senior",
      //   name: "Super Senior",
      //   symbol: "SENIOR",
      //   balance: 0,
      //   balanceUsd: 0,
      //   image: stakeicon,
      //   type: "staking",
      //   apy: "11-13% Guaranteed",
      //   link: "/stakevault/senior",
      //   network: "Mantra",
      // });

      // assets.push({
      //   id: "junior",
      //   name: "Junior",
      //   symbol: "JUNIOR",
      //   balance: 0,
      //   balanceUsd: 0,
      //   image: stakeicon,
      //   type: "staking",
      //   apy: "29%",
      //   link: "/stakevault/junior",
      //   network: "Mantra",
      // });
    }

    // Add dividend tokens
    // if (mydividends?.data) {
    //   assets.push({
    //     id: "cmt",
    //     name: "CMT",
    //     symbol: "CMT",
    //     balance: 0,
    //     balanceUsd: 0,
    //     image: stakeicon,
    //     type: "dividend",
    //     link: "/dividend/cmt",
    //     apy: "5%",
    //   });

    //   assets.push({
    //     id: "strat",
    //     name: "STRAT",
    //     symbol: "STRAT",
    //     balance: 0,
    //     balanceUsd: 0,
    //     image: stakeicon,
    //     type: "dividend",
    //     link: "/dividend/strat",
    //     apy: "3%",
    //   });

    //   assets.push({
    //     id: "cheap",
    //     name: "CHEAP",
    //     symbol: "CHEAP",
    //     balance: 0,
    //     balanceUsd: 0,
    //     image: stakeicon,
    //     type: "dividend",
    //     link: "/dividend/cheap",
    //     apy: "2%",
    //   });
    // }

    // Add launchpad tokens
    // if (launchPaddata?.data) {
    //   launchPaddata.data.forEach((store) => {
    //     assets.push({
    //       id: store.id,
    //       name: store.store_name,
    //       symbol: store.symbol,
    //       balance: 0, // We don't have balance info from the API
    //       balanceUsd: 0,
    //       image: store.logo_url,
    //       type: "launchpad",
    //       link: `/launchpad/${store.id}`,
    //     });
    //   });
    // }

    // Add PST tokens
    // if (pstTokensdata?.data) {
    //   pstTokensdata.data.forEach((token, index) => {
    //     assets.push({
    //       id: token.symbol + index,
    //       name: token.symbol,
    //       symbol: token.symbol,
    //       balance: 0, // We don't have balance info from the API
    //       balanceUsd: 0,
    //       image: token.logo_url,
    //       type: "token",
    //       link: `/pst/${token.symbol}/${token.price}`,
    //     });
    //   });
    // }

    return assets;
  }, [stakingbalance, stakinginfo, mydividends, launchPaddata, pstTokensdata]);

  // Fix for NaN percentage calculation
  const getAverageStakingPercentage = () => {
    if (!stakinginfo?.data || !stakingbalance?.data) return "0";

    if (Number(stakingbalance?.data?.lstBalance) === 0) return "0";

    const treasuryValue = Number(stakinginfo?.data?.treasuryValue || 0);
    const totalStaked = Number(stakinginfo?.data?.totalStaked || 0);

    if (totalStaked === 0) return "0";

    return formatUsdSimple(Math.abs((treasuryValue / totalStaked - 1) * 100));
  };

  // Sort assets by value (highest first) and group by type
  const sortedPortfolioAssets = useMemo(() => {
    // Sort function: prioritize by type, then by value
    return [...portfolioAssets].sort((a, b) => {
      // Priority order: staking, dividend, launchpad, token, amm
      const typeOrder = {
        staking: 1,
        dividend: 2,
        launchpad: 3,
        token: 4,
        amm: 5,
      };

      // First sort by type
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }

      // Then sort by value (highest first)
      return b?.balanceUsd || 0 - a?.balanceUsd || 0;
    });
  }, [portfolioAssets]);

  // Group assets by type
  const groupedAssets = useMemo(() => {
    const grouped = {
      staking: sortedPortfolioAssets.filter(
        (asset) => asset.type === "staking"
      ),
      dividend: sortedPortfolioAssets.filter(
        (asset) => asset.type === "dividend"
      ),
      launchpad: sortedPortfolioAssets.filter(
        (asset) => asset.type === "launchpad"
      ),
      token: sortedPortfolioAssets.filter((asset) => asset.type === "token"),
      amm: sortedPortfolioAssets.filter((asset) => asset.type === "amm"),
    };

    // Only include categories that have assets
    return Object.entries(grouped)
      .filter(([_, assets]) => assets.length > 0)
      .map(([type, assets]) => ({
        type: type as "staking" | "dividend" | "launchpad" | "token" | "amm",
        assets,
        totalValue: assets.reduce(
          (sum, asset) => sum + asset?.balanceUsd || 0,
          0
        ),
      }));
  }, [sortedPortfolioAssets]);

  // Add sub-filter for portfolio assets
  const [portfolioFilter, _setPortfolioFilter] = useState<
    "all" | "staking" | "dividend" | "launchpad" | "token" | "amm"
  >("all");

  // Get filtered assets based on the portfolio filter
  const filteredAssets = useMemo(() => {
    if (portfolioFilter === "all") {
      return groupedAssets;
    }
    return groupedAssets.filter((group) => group.type === portfolioFilter);
  }, [groupedAssets]);

  // Mock performance data for graphs (in real app, this would come from API)

  // Get color for asset type
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      staking: "#0fb14d", // colors.$success
      dividend: "#5b8def", // colors.$info
      launchpad: "#ff9f1c", // colors.$warning
      token: "#496bcc", // colors.$accent
      amm: "#5b8def", // colors.$info
    };
    return colors[type] || "#ffffff";
  };

  useBackButton(goBack);

  const isLoading =
    dividendsloading ||
    pstLoading ||
    launchpadLoading ||
    stakinginfoloading ||
    stakingbalanceloading;

  return (
    <section id="defitab">
      {isLoading && (
        <div className="h-screen flex justify-center items-center">
          <Loading width="2rem" height="2rem" />
        </div>
      )}

      {!isLoading && (
        <div className="portfolio-container">
          {/* Asset List */}
          <div className="portfolio-assets">
            {filteredAssets.length === 0 ? (
              <div className="no-assets">
                <p>No assets found in this category</p>
              </div>
            ) : (
              <>
                {/* Highlight guaranteed returns if in All Assets or Staking filter */}
                {(portfolioFilter === "all" || portfolioFilter === "staking") &&
                  groupedAssets.find((group) => group.type === "staking") && (
                    <div className="featured-assets">
                      <div className="flex items-center gap-2">
                        <FaIcon
                          faIcon={faCheckCircle}
                          fontsize={14}
                          color={colors.accent}
                        />
                        <h4>Sphere Vault - 11-13% Guaranteed Returns</h4>
                      </div>
                      <div className="featured-assets-list">
                        {groupedAssets
                          .find((group) => group.type === "staking")
                          ?.assets.filter(
                            (asset) => asset.name === "Sphere Vault"
                          )
                          .map((asset) => (
                            <PortfolioAsset
                              key={asset.id}
                              asset={asset}
                              onClick={() => navigate(asset.link)}
                              getTypeColor={getTypeColor}
                              stakinginfotvl={
                                stakinginfo?.data?.treasuryValue || 0
                              }
                              userBalance={
                                Number(stakingbalance?.data?.lstBalance) || 0
                              }
                              totalStaked={stakinginfo?.data?.totalStaked || 0}
                              avgAPY={getAverageStakingPercentage()}
                            />
                          ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

interface PortfolioAssetProps {
  asset: AssetType;
  onClick: () => void;
  getTypeColor: (type: string) => string;
  stakinginfotvl?: string | number;
  userBalance: number;
  totalStaked: number | string;
  avgAPY: string;
}

const PortfolioAsset = ({
  asset,
  onClick,

  stakinginfotvl,
  userBalance,
  totalStaked,
  avgAPY,
}: PortfolioAssetProps): JSX.Element => {
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<"apy" | "treasury">("apy");

  // Generate mock APY history data for the graph
  const apyHistoryData = useMemo(() => {
    if (asset.name === "Sphere Vault" || asset.name === "Super Senior") {
      return [
        { month: "Jan", apy: 11.5, treasury: 10.0, competitors: 4.2 },
        { month: "Feb", apy: 12.3, treasury: 10.8, competitors: 3.8 },
        { month: "Mar", apy: 11.8, treasury: 11.5, competitors: 4.0 },
        { month: "Apr", apy: 13.0, treasury: 12.8, competitors: 4.5 },
        { month: "May", apy: 12.2, treasury: 14.5, competitors: 5.0 },
        { month: "Jun", apy: 11.7, treasury: 16.2, competitors: 4.8 },
        { month: "Jul", apy: 12.8, treasury: 18.7, competitors: 4.2 },
        { month: "Aug", apy: 12.5, treasury: 21.5, competitors: 3.9 },
        { month: "Sep", apy: 11.2, treasury: 24.6, competitors: 4.0 },
        { month: "Oct", apy: 12.0, treasury: 28.0, competitors: 3.7 },
        { month: "Nov", apy: 12.7, treasury: 32.5, competitors: 3.8 },
        { month: "Dec", apy: 11.9, treasury: 37.0, competitors: 4.1 },
      ];
    }
    return [];
  }, [asset.name]);

  // Check if this is the Sphere Vault with guaranteed return
  const isSphereVault =
    asset.name === "Sphere Vault" && asset.type === "staking";

  // Always expanded for Sphere Vault
  const assetClasses = `portfolio-asset-item ${
    isSphereVault ? "guaranteed buffet-vault expanded" : ""
  }`;

  // Get background color based on asset type for aesthetic styling
  const getBackgroundColor = () => {
    return "#0e0e0e";
  };

  const formatTvl = (tvl: string | number | undefined): string => {
    if (typeof tvl === "undefined") return "0";
    const numValue = typeof tvl === "string" ? Number(tvl) || 0 : tvl || 0;
    return formatUsdSimple(numValue);
  };

  const formatBalance = (balance: number): string => {
    return formatUsd(balance || 0);
  };

  const formatNumber = (num: number | string): number => {
    if (typeof num === "string") return Number(num) || 0;
    return num || 0;
  };

  return (
    <div
      className={assetClasses}
      onClick={isSphereVault ? undefined : onClick}
      style={{ background: getBackgroundColor() }}
    >
      <div className="asset-main">
        <div className="asset-icon-name">
          <img src={asset.image} alt={asset?.name} />
          <div className="asset-details">
            <span className="asset-name">{asset?.name}</span>
            <div className="asset-symbols">
              <span className="asset-symbol">{asset?.symbol}</span>
              {asset.network && (
                <span className="asset-network">{asset?.network}</span>
              )}
              {isSphereVault && <span className="asset-rwa">RWA</span>}
            </div>
            {isSphereVault && (
              <div className="guaranteed-tag">
                <FaIcon
                  faIcon={faCheckCircle}
                  fontsize={10}
                  color={colors.success}
                />
                <span>11-13% Guaranteed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSphereVault && (
        <div className="staking-info">
          <div className="staking-row">
            <div className="staking-label">Your Balance:</div>
            <div className="staking-value">{formatBalance(userBalance)}</div>
          </div>
          <div className="staking-row">
            <div className="staking-label">24h APY:</div>
            <div className="staking-value positive">{avgAPY}%</div>
          </div>
          <div className="staking-row">
            <div className="staking-label">TVL:</div>
            <div className="staking-value">${formatTvl(stakinginfotvl)}</div>
          </div>
          <div className="staking-row">
            <div className="staking-label">Total Staked:</div>
            <div className="staking-value">
              ${formatUsdSimple(formatNumber(totalStaked))}
            </div>
          </div>
        </div>
      )}

      {isSphereVault && (
        <div className="expanded-content">
          <div className="asset-allocation">
            <h5>Where Your Money is Invested</h5>
            <div className="allocation-chart">
              <div className="allocation-item">
                <div
                  className="allocation-bar"
                  style={{ width: "45%", backgroundColor: colors.success }}
                ></div>
                <div className="allocation-label">
                  <span>45%</span>
                  <p>AAVE Lending Pools</p>
                </div>
              </div>
              <div className="allocation-item">
                <div
                  className="allocation-bar"
                  style={{ width: "30%", backgroundColor: "#5b8def" }}
                ></div>
                <div className="allocation-label">
                  <span>30%</span>
                  <p>Compound Finance</p>
                </div>
              </div>
              <div className="allocation-item">
                <div
                  className="allocation-bar"
                  style={{ width: "25%", backgroundColor: "#ff9f1c" }}
                ></div>
                <div className="allocation-label">
                  <span>25%</span>
                  <p>Lido Staking Protocol</p>
                </div>
              </div>
            </div>
            <p className="allocation-note">
              Treasury backed by real-world assets in Asia (tokenized shopping
              centers)
            </p>
          </div>

          <div className="apy-history-graph">
            <div className="chart-header">
              <h5>Performance History</h5>
              <div className="chart-toggle">
                <button
                  className={activeChart === "apy" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChart("apy");
                  }}
                >
                  APY
                </button>
                <button
                  className={activeChart === "treasury" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChart("treasury");
                  }}
                >
                  Treasury Growth
                </button>
              </div>
            </div>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height={150}>
                {activeChart === "apy" ? (
                  <LineChart
                    data={apyHistoryData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "rgba(255, 255, 255, 0.6)" }}
                      axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                    />
                    <YAxis
                      domain={[0, 14]}
                      tick={{ fill: "rgba(255, 255, 255, 0.6)" }}
                      axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "apy")
                          return [`${value}%`, "Sphere Vault"];
                        if (name === "competitors")
                          return [`${value}%`, "Other Protocols"];
                        return [value, name];
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 20, 0.8)",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                      }}
                    />
                    <Legend
                      align="center"
                      verticalAlign="bottom"
                      height={20}
                      wrapperStyle={{ fontSize: "0.7rem", paddingTop: "5px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="apy"
                      name="Sphere Vault"
                      stroke={colors.success}
                      strokeWidth={2}
                      dot={{ stroke: colors.success, strokeWidth: 2, r: 3 }}
                      activeDot={{
                        r: 5,
                        stroke: colors.success,
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="competitors"
                      name="Other Protocols"
                      stroke="#888"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={{ stroke: "#888", strokeWidth: 1, r: 2 }}
                      activeDot={{
                        r: 4,
                        stroke: "#888",
                        strokeWidth: 1,
                      }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    data={apyHistoryData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorTreasury"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={colors.accent}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={colors.accent}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "rgba(255, 255, 255, 0.6)" }}
                      axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                    />
                    <YAxis
                      domain={[0, 40]}
                      tick={{ fill: "rgba(255, 255, 255, 0.6)" }}
                      axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      tickFormatter={(value) => `$${value}M`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}M`, "Treasury"]}
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 20, 0.8)",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="treasury"
                      name="Treasury"
                      stroke={colors.accent}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTreasury)"
                      dot={{ stroke: colors.accent, strokeWidth: 2, r: 3 }}
                      activeDot={{
                        r: 5,
                        stroke: colors.accent,
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <button
              className="stake-now-button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(asset.link);
              }}
            >
              <span>Stake Now</span>
              <FaIcon faIcon={faArrowRight} fontsize={16} color="#ffffff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const StakingReward = ({
  image,
  tokenid,
  tokenname,
  rewardvalue,
}: {
  image: string;
  tokenid: string;
  tokenname: string;
  rewardvalue: number;
}): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="stakingreward">
      <div className="img_token_name">
        <img src={image} alt={tokenname} />
        <p>
          {tokenname}
          <span>
            {rewardvalue} st{tokenname.split(" ").join("")}
          </span>
        </p>
      </div>

      <button onClick={() => navigate(`/stake/${tokenid}`)}>
        Stake
        <FaIcon
          faIcon={faLayerGroup}
          fontsize={14}
          color={colors.textprimary}
        />
      </button>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const techgrityProducts: (stakeproducttype & {
  popularity: number;
  apyHistory?: number[];
  tvlHistory?: number[];
  lockPeriod?: string;
  minDeposit?: number;
  hasMonthlyDividend?: boolean;
})[] = [
  {
    id: "tg00",
    name: "Techgrity Super Senior",
    apy: "11-13% Guaranteed",
    currentTvl: "$26,000,000",
    maxCapacity: "$26,000,000",
    network: "Techgrity",
    lockPeriod: "7 days",
    minDeposit: 100,
    hasMonthlyDividend: false,
    popularity: 2,
    apyHistory: [11, 12, 11, 13, 12, 11, 12, 13, 11, 12, 13, 12],
    tvlHistory: [10000000, 15000000, 18000000, 22000000, 24000000, 26000000],
  },
  {
    id: "tg01",
    name: "Techgrity Junior",
    apy: "29%",
    currentTvl: "$25,000,000",
    maxCapacity: "$25,000,000",
    network: "Techgrity",
    lockPeriod: "7 days",
    minDeposit: 50,
    hasMonthlyDividend: true,
    popularity: 4,
    apyHistory: [8, 8.2, 8.5, 8.8, 9, 9.2, 9, 8.9, 9.1, 9.2, 9, 9],
    tvlHistory: [8000000, 12000000, 16000000, 20000000, 22000000, 25000000],
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const ammPools: ammPoolType[] = [
  {
    name: "PST / WUSD",
    apy: 15,
    hasMonthlyDividend: true,
    minDeposit: 250,
    minLockPeriod: null,
    lockPeriod: "7 days",
    popularity: 4,
  },
  {
    name: "PST / USDC",
    apy: 13,
    hasMonthlyDividend: true,
    minDeposit: 200,
    minLockPeriod: null,
    lockPeriod: "7 days",
    popularity: 6,
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const sphereVaults: sphereVaultType[] = [
  {
    id: "st00",
    name: "Super Senior",
    strategy: "super-senior",
    apy: "11-13% Guaranteed",
    currentTvl: "$22,698,886.84",
    maxCapacity: "26,000,000",
    network: "Mantra",
    lockPeriod: "30 days",
  },
  {
    id: "st01",
    name: "Junior",
    strategy: "junior",
    apy: "29%",
    currentTvl: "$22,698,886.84",
    maxCapacity: "26,000,000",
    network: "Mantra",
    lockPeriod: "30 days",
  },
  {
    id: "st00",
    name: "Super Senior",
    strategy: "super-senior",
    apy: "11-13% Guaranteed",
    currentTvl: "$22,698,886.84",
    maxCapacity: "26,000,000",
    network: "Berachain",
    lockPeriod: "30 days",
  },
  {
    id: "st01",
    name: "Junior",
    strategy: "junior",
    apy: "29%",
    currentTvl: "$22,698,886.84",
    maxCapacity: "26,000,000",
    network: "Berachain",
    lockPeriod: "30 days",
  },
];
