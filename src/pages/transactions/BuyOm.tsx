import { JSX, useEffect, useState } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";
import ethlogo from "../../assets/images/eth.png";
import "../../styles/pages/buyom.css";

export default function BuyOm(): JSX.Element {
  const navigate = useNavigate();

  const [getQty, setGetQty] = useState<number>(0);

  //   const ethbalUsd = Number(localStorage.getItem("ethbalUsd"));
  const ethbal = Number(localStorage.getItem("ethbal"));

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

          <p>
            ETH <br /> <span>{ethbal.toFixed(2)}</span>
          </p>
        </div>

        <input
          className="qtyinput"
          type="number"
          value={getQty}
          onChange={(ev) => setGetQty(Number(ev.target.value))}
        />
      </div>
    </section>
  );
}
