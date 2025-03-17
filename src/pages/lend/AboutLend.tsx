import { JSX, useState } from "react";
import {
  faArrowRight,
  faCircleQuestion,
  faFlag,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { BottomButtonContainer } from "../../components/Bottom";
import { SubmitButton } from "../../components/global/Buttons";
import { FaIcon } from "../../assets/faicon";
import { colors } from "../../constants";
import "../../styles/pages/lend/aboutlend.scss";

export default function AboutLend(): JSX.Element {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"keys" | "crypto">("keys");

  const startLend = () => {
    localStorage.setItem("firsttimelend", "false");
    navigate("/lend");
  };

  return (
    <section id="aboutlend">
      <p className="title">
        Lend
        <span>Secure Web2 Keys & Crypto Lending</span>
      </p>

      <p className="desc">
        Share access to your Web2 Keys and Crypto assets securely while staying
        in control.
      </p>

      <p className="howitworks">
        <FaIcon
          faIcon={faCircleQuestion}
          color={colors.textsecondary}
          fontsize={14}
        />
        How it works
      </p>

      <div className="filters">
        <button
          className={filter == "keys" ? "active" : ""}
          onClick={() => setFilter("keys")}
        >
          Lend Web2 Keys
          <FaIcon
            faIcon={faLock}
            color={filter == "keys" ? colors.textprimary : colors.textsecondary}
            fontsize={12}
          />
        </button>
        <button
          className={filter == "crypto" ? "active" : ""}
          onClick={() => setFilter("crypto")}
        >
          Lend Crypto
          <FaIcon
            faIcon={faFlag}
            color={
              filter == "crypto" ? colors.textprimary : colors.textsecondary
            }
            fontsize={12}
          />
        </button>
      </div>

      {filter == "keys" && (
        <div className="keys">
          <p>
            1. Create a Scoped Lending Link
            <span>
              Choose the key you would like to lend and we will create a secure
              link for you to share. Supported Web2 keys (OpenAi, AirWallex,
              Polymarket).
            </span>
          </p>
          <p>
            2. Choose a payment option
            <span>
              Choose how you would like to get paid for your key. Supported
              payment options (HKD, USD, USDC, ETH, BTC, OM, WUSD).
            </span>
          </p>
          <p>
            3. Set Expiry
            <span>
              To prevent abuse of free keys (Keys lent at no cost, $0), you have
              to set an access time indicating when the shared link will be
              valid.
            </span>
          </p>
          <p>
            4. Share the link
            <span>
              We will generate a secure link for you to share with the intended
              receipient. You can copy the link and share it as a Message or
              Email or send it directly on Telegram.
            </span>
          </p>
          <p>
            5. Track and Revoke Access
            <span>
              To ensure you remain in control of your keys, you will be able to
              see whos'e using you key(s) and revoke access at any time.
              Revoking access will prevent them from using you key(s) untill you
              share it with them again.
            </span>
          </p>
          <p className="supported">
            Supported Web2 Keys <br /> ( OpenAi, AirWallex, Polymarket )
          </p>
        </div>
      )}

      {filter == "crypto" && (
        <div className="keys">
          <p>
            1. Create a Scoped Lending Link
            <span>
              Choose the crypto asset and the usage restrictions associated with
              it and we will create a secure link for you to share.
            </span>
          </p>

          <p>
            2. Set a usage restriction
            <span>
              You get to choose what the your lent crypto will be used for. Lent
              tokens can be used for Staking delegation, Marketplace purchases,
              Governance voting and Liquidity provision.
            </span>
          </p>

          <p>
            3. Profits distribution
            <span>
              Lent crypto earns profits and you can choose how much of the
              realised profits you get to keep.
            </span>
          </p>

          <p>
            4. Share the link
            <span>
              We will generate a secure link for you to share with the intended
              receipient. You can copy the link and share it as a Message or
              Email or send it directly on Telegram.
            </span>
          </p>
        </div>
      )}

      <BottomButtonContainer>
        <SubmitButton
          text="Start Lending"
          icon={<FaIcon faIcon={faArrowRight} color={colors.textprimary} />}
          sxstyles={{
            padding: "0.625rem",
            borderRadius: "1.5rem",
            backgroundColor: colors.success,
          }}
          onclick={startLend}
        />
      </BottomButtonContainer>
    </section>
  );
}
