import { JSX, useEffect, useState } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";
import { formatUsd } from "../../utils/formatters";
import ethlogo from "../../assets/images/eth.png";
import { colors } from "../../constants";
import "../../styles/pages/buyom.scss";

export default function BuyOm(): JSX.Element {
  const navigate = useNavigate();

  const [getQty, setGetQty] = useState<number>(0);

  const ethbalUsd = Number(localStorage.getItem("ethbalUsd"));
  const ethbal = Number(localStorage.getItem("ethbal"));
  const ethusd = Number(localStorage.getItem("ethvalue"));
  const mantraUsd = Number(localStorage.getItem("mantrausdval"));

  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
      backButton.show();
    }

    if (backButton.isMounted()) {
      backButton.onClick(goBack);
    }

    return () => {
      backButton.offClick(goBack);
      backButton.unmount();
    };
  }, []);

  return (
    <section id="buyom">
      <p className="title">
        Get OM <br />
        <span>Buy OM using your ETH balance</span>
      </p>

      <div className="balancectr">
        <div className="currency">
          <img src={ethlogo} alt="eth" />

          <p>ETH</p>
        </div>

        <input
          className="qtyinput"
          type="number"
          min="0"
          step="any"
          placeholder="Amount (ETH)"
          style={{ color: getQty >= ethbal ? colors.danger : "" }}
          value={getQty == 0 ? "" : getQty}
          onChange={(ev) => setGetQty(Number(ev.target.value))}
        />
      </div>
      <p className="fiatbal">
        {ethbal.toFixed(5)} ETH ~ {formatUsd(ethbalUsd)}
      </p>

      <p
        className="omamount"
        style={{ color: getQty >= ethbal ? colors.danger : "" }}
      >
        You Get
        <br />
        <span style={{ color: getQty >= ethbal ? colors.danger : "" }}>
          {getQty == 0 ? "0" : ((getQty * ethusd) / mantraUsd).toFixed(2)}
          &nbsp; <em>OM</em>
        </span>
      </p>

      <button className="getbuyom">Get OM</button>
    </section>
  );
}
