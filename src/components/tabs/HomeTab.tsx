import { Fragment, JSX, useEffect, useState } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { AppBar } from "../AppBar";
import { AssetBalance, WalletAction, WalletBalance } from "../WalletBalance";
import { ArrowDownCircle, ArrowUpCircle, Rotate } from "../../assets/icons";
import { getAllBalances } from "../../utils/api/balances";
// import { getUnlockedTokens } from "../../utils/api/airdrop";
// import { fetchCoinInfo } from "../../utils/coingecko/markets";
// import { getSphrUsdcRate } from "../../utils/api/sphere";
import { colors } from "../../constants";
import btclogo from "../../assets/images/logos/btc.png";
import ethlogo from "../../assets/images/logos/eth.png";
import usdclogo from "../../assets/images/logos/usdc.png";
import usdtlogo from "../../assets/images/logos/usdt.png";
import arblogo from "../../assets/images/logos/arbitrum.png";
import dailogo from "../../assets/images/logos/dai.png";
import beralogo from "../../assets/images/logos/bera.png";
import maticlogo from "../../assets/images/logos/matic.png";
import lisklogo from "../../assets/images/logos/lisk.png";
import bnblogo from "../../assets/images/logos/bnb.png";
import optimismlogo from "../../assets/images/logos/optimism.png";
import "../../styles/components/tabs/hometab.scss";

export const HomeTab = (): JSX.Element => {
  const navigate = useNavigate();

  const [networkFilter, setNetworkFilter] = useState<
    | "all"
    | "ethereum"
    | "arbitrum"
    | "base"
    | "polygon"
    | "optimism"
    | "lisk"
    | "bnb"
    | "berachain"
  >("all");
  const [tokensTypeFilter, setTokensTypeFilter] = useState<
    | "all"
    | "stablecoin"
    | "native"
    | "native-wrapped"
    | "btc-derivative"
    | "staked-eth"
    | "governance"
  >("all");

  const { data: allbalances, isPending: balancesloading } = useQuery({
    queryKey: ["allbalances"],
    queryFn: getAllBalances,
  });

  const onFilterTokensType = (
    filter:
      | "stablecoin"
      | "native"
      | "native-wrapped"
      | "btc-derivative"
      | "staked-eth"
      | "governance"
  ) => {
    if (tokensTypeFilter == filter) {
      setTokensTypeFilter("all");
    } else {
      setTokensTypeFilter(filter);
    }
  };

  const onFilterNetwork = (
    filter:
      | "ethereum"
      | "arbitrum"
      | "base"
      | "polygon"
      | "optimism"
      | "lisk"
      | "bnb"
      | "berachain"
  ) => {
    if (networkFilter == filter) {
      setNetworkFilter("all");
    } else {
      setNetworkFilter(filter);
    }
  };

  const goToSendCryptoMethods = () => {
    navigate("/send-crypto-methods/ETH/send");
  };

  const goToDepositCrypto = () => {
    navigate("/deposit/ETH");
  };

  const goToSwap = () => {
    navigate("/swap-network");
  };

  const goToEthAsset = () => {
    navigate("/eth-asset/send");
  };

  const goToBeraAsset = () => {
    navigate("/bera-asset/send");
  };

  const goToPolygonUsdcAsset = () => {
    navigate("/polygon-usdc-asset/send");
  };

  const goToBeraUsdcAsset = () => {
    navigate("/bera-usdc-asset/send");
  };

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
    }

    if (backButton.isVisible()) {
      backButton.hide();
    }

    return () => {
      backButton.unmount();
    };
  }, []);

  return (
    <Fragment>
      <AppBar />

      <div id="hometab">
        <WalletBalance
          balancesLoading={balancesloading}
          ethBalanceUsd={0}
          beraBalanceUsd={0}
          polygonUsdcBalanceUsd={0}
          beraUsdcbalanceUsd={0}
          sphereBalanceUsd={0}
        />

        <div className="actions">
          <WalletAction
            icon={<ArrowUpCircle color={colors.textprimary} />}
            text="Send"
            onclick={goToSendCryptoMethods}
          />

          <WalletAction
            icon={<ArrowDownCircle color={colors.textprimary} />}
            text="Deposit"
            onclick={goToDepositCrypto}
          />

          <WalletAction
            icon={<Rotate color={colors.textprimary} />}
            text="Swap"
            onclick={goToSwap}
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
            onClick={() => onFilterTokensType("stablecoin")}
            className={tokensTypeFilter == "stablecoin" ? "active" : ""}
          >
            Stablecoins
          </button>

          <button
            onClick={() => onFilterTokensType("native-wrapped")}
            className={tokensTypeFilter == "native-wrapped" ? "active" : ""}
          >
            Wrapped
          </button>

          <button
            onClick={() => onFilterTokensType("governance")}
            className={tokensTypeFilter == "governance" ? "active" : ""}
          >
            Governance
          </button>

          <button
            onClick={() => onFilterTokensType("staked-eth")}
            className={tokensTypeFilter == "staked-eth" ? "active" : ""}
          >
            Staked
          </button>

          <button
            onClick={() => onFilterTokensType("btc-derivative")}
            className={tokensTypeFilter == "btc-derivative" ? "active" : ""}
          >
            BTC
          </button>

          <button
            onClick={() => onFilterNetwork("ethereum")}
            className={networkFilter == "ethereum" ? "active" : ""}
          >
            Ethereum Mainnet
          </button>

          <button
            onClick={() => onFilterNetwork("arbitrum")}
            className={networkFilter == "arbitrum" ? "active" : ""}
          >
            Arbitrum
          </button>

          <button
            onClick={() => onFilterNetwork("base")}
            className={networkFilter == "base" ? "active" : ""}
          >
            Base
          </button>

          <button
            onClick={() => onFilterNetwork("polygon")}
            className={networkFilter == "polygon" ? "active" : ""}
          >
            Polygon
          </button>

          <button
            onClick={() => onFilterNetwork("optimism")}
            className={networkFilter == "optimism" ? "active" : ""}
          >
            Optimism
          </button>

          <button
            onClick={() => onFilterNetwork("lisk")}
            className={networkFilter == "lisk" ? "active" : ""}
          >
            Lisk
          </button>

          <button
            onClick={() => onFilterNetwork("bnb")}
            className={networkFilter == "bnb" ? "active" : ""}
          >
            BNB
          </button>

          <button
            onClick={() => onFilterNetwork("berachain")}
            className={networkFilter == "berachain" ? "active" : ""}
          >
            Berachain
          </button>
        </div>

        {(networkFilter == "all" || networkFilter == "ethereum") &&
          allbalances?.data?.ethereum?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Ethereum Mainnet"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "arbitrum") &&
          allbalances?.data?.arbitrum?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Arbitrum"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "base") &&
          allbalances?.data?.base?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Base"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "polygon") &&
          allbalances?.data?.polygon?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Polygon"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "optimism") &&
          allbalances?.data?.optimism?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Optimism"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "lisk") &&
          allbalances?.data?.lisk?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Lisk"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "bnb") &&
          allbalances?.data?.bnb?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="BNB"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}

        {(networkFilter == "all" || networkFilter == "berachain") &&
          allbalances?.data?.berachain?.map((asset) => (
            <Fragment>
              {(tokensTypeFilter == "all" ||
                asset?.category == tokensTypeFilter) && (
                <AssetBalance
                  tokenLoading={balancesloading}
                  tokenImage={
                    asset?.symbol == "ETH" ||
                    asset?.symbol == "WETH" ||
                    asset?.symbol == "WSTETH" ||
                    asset?.symbol == "RETH" ||
                    asset?.symbol == "CBETH"
                      ? ethlogo
                      : asset?.symbol == "WBTC" ||
                        asset?.symbol == "CBBTC" ||
                        asset?.symbol == "TBTC"
                      ? btclogo
                      : asset?.symbol == "ARB"
                      ? arblogo
                      : asset?.symbol == "BERA" || asset?.symbol == "WBERA"
                      ? beralogo
                      : asset?.symbol == "DAI"
                      ? dailogo
                      : asset?.symbol == "USDC" || asset?.symbol == "USDC.e"
                      ? usdclogo
                      : asset?.symbol == "USDT"
                      ? usdtlogo
                      : asset?.symbol == "OP"
                      ? optimismlogo
                      : asset?.symbol == "MATIC"
                      ? maticlogo
                      : asset?.symbol == "LSK"
                      ? lisklogo
                      : bnblogo
                  }
                  tokenName={asset?.symbol}
                  tokenSymbol={asset?.symbol}
                  network="Berachain"
                  balance={Number(asset?.balance)}
                  onClickHandler={goToEthAsset}
                />
              )}
            </Fragment>
          ))}
      </div>
    </Fragment>
  );
};
