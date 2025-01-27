import { JSX, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Skeleton } from "@mui/material";
import { walletBalance, uSdTBalance } from "../utils/api/wallet";
import { getBtcUsdVal, getEthUsdVal } from "../utils/ethusd";
import { formatUsd, formatNumber } from "../utils/formatters";
import btclogo from "../assets/images/btc.png";
import ethlogo from "../assets/images/eth.png";
import usdclogo from "../assets/images/labs/mantralogo.jpeg";
import "../styles/components/walletbalance.css";

export const WalletBalance = (): JSX.Element => {
  const navigate = useNavigate();

  const [accBalLoading, setAccBalLoading] = useState<boolean>(false);
  const [accBalance, setAccBalance] = useState<number>(0);
  const [btcAccBalance, setBtcAccAccBalance] = useState<number>(0);
  const [btcAccBalanceUsd, setBtcAccAccBalanceUsd] = useState<number>(0);
  const [usdtAccBalance, setusdtAccBalance] = useState<number>(0);
  const [amountInUsd, setAmountInUsd] = useState<number>(0);

  const initialfetch = localStorage.getItem("initialfetch");

  const btcbal: number =
    btcAccBalance == 0 ? Number(localStorage.getItem("btcbal")) : btcAccBalance;
  const ethbal: number =
    accBalance == 0 ? Number(localStorage.getItem("ethbal")) : accBalance;
  const usdcbal: number =
    usdtAccBalance == 0
      ? Number(localStorage.getItem("usdtbal"))
      : usdtAccBalance;
  const btcbalUsd: number =
    btcAccBalanceUsd == 0
      ? Number(localStorage.getItem("btcbalUsd"))
      : btcAccBalanceUsd;
  const ethbalUsd: number =
    amountInUsd == 0 ? Number(localStorage.getItem("ethbalUsd")) : amountInUsd;

  const getWalletBalance = useCallback(async () => {
    setAccBalLoading(true);

    let access: string | null = localStorage.getItem("token");

    const { btcBalance, balance } = await walletBalance(access as string);
    const { ethInUSD, ethValue } = await getEthUsdVal(Number(balance));
    const { btcQtyInUSD } = await getBtcUsdVal(Number(btcBalance));
    const { data } = await uSdTBalance(access as string);

    setAccBalance(Number(balance));
    setBtcAccAccBalance(btcBalance);
    setusdtAccBalance(Number(data?.balance));

    setBtcAccAccBalanceUsd(btcQtyInUSD);
    setAmountInUsd(ethInUSD);

    localStorage.setItem("btcbal", String(btcBalance));
    localStorage.setItem("btcbalUsd", String(btcQtyInUSD));
    localStorage.setItem("ethbal", balance);
    localStorage.setItem("ethbalUsd", String(ethInUSD));
    localStorage.setItem("usdtbal", data?.balance);
    localStorage.setItem("ethvalue", String(ethValue));
    localStorage.setItem("initialfetch", "false");

    setAccBalLoading(false);
  }, []);

  useEffect(() => {
    getWalletBalance();
  }, []);

  return (
    <div id="walletbalance">
      <p className="bal">Wallet Balance</p>

      <p className="balinusd">
        {accBalLoading && initialfetch == null ? (
          <Skeleton
            variant="text"
            width="50%"
            height="2.5rem"
            animation="wave"
          />
        ) : (
          `${formatUsd(btcbalUsd + ethbalUsd + usdcbal)}`
        )}
      </p>

      {accBalLoading && initialfetch == null ? (
        <>
          <Skeleton
            variant="text"
            width="100%"
            height="3.75rem"
            animation="wave"
          />
          <Skeleton
            variant="text"
            width="100%"
            height="3.75rem"
            animation="wave"
          />
          <Skeleton
            variant="text"
            width="100%"
            height="3.75rem"
            animation="wave"
          />
        </>
      ) : (
        <>
          <div className="_asset" onClick={() => navigate("/btc-asset")}>
            <div>
              <img src={btclogo} alt="btc" />

              <p>
                Bitcoin
                <span>BTC</span>
              </p>
            </div>

            <p className="balance">
              <span>{formatNumber(btcbal)}</span>

              <span className="fiat">{formatUsd(btcbalUsd)}</span>
            </p>
          </div>

          <div className="_asset" onClick={() => navigate("/eth-asset")}>
            <div>
              <img src={ethlogo} alt="btc" />

              <p>
                Ethereum
                <span>ETH</span>
              </p>
            </div>

            <p className="balance">
              <span>{formatNumber(ethbal)}</span>

              <span className="fiat">{formatUsd(ethbalUsd)}</span>
            </p>
          </div>

          <div className="_asset" onClick={() => navigate("/usdt-asset")}>
            <div>
              <img src={usdclogo} alt="btc" />

              <p>
                Mantra DAO
                <span>OM</span>
              </p>
            </div>

            <p className="balance">
              <span>{formatNumber(usdcbal)}</span>

              <span className="fiat">{formatUsd(usdcbal)}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};
