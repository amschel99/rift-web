import { JSX } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
import { SubmitButton } from "../../components/global/Buttons";
import { colors } from "../../constants";
import { Import } from "../../assets/icons/actions";
import poelogo from "../../assets/images/icons/poe.png";
import mantralogo from "../../assets/images/labs/mantralogo.jpeg";
import "../../styles/pages/transactions/claimlendkeylink.scss";

export default function ClaimLendKeyLink(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="claimlendkeylink">
      <span className="icon_ctr">
        <Import color={colors.textprimary} />
      </span>

      <div className="received_key">
        <img src={poelogo} alt="received-key" />
        <p className="key_val">
          POE / OPENAI KEY <span>skpo9...</span>
        </p>
        <p className="desc">
          You have received a paid POE / OPENAI key. <br /> Click claim to pay
          for the key, access and use the key.
        </p>
      </div>

      <div className="pay_key_ctr">
        <p className="title">
          Pay <span>$18</span> To Use Key
        </p>

        <div className="amount">
          <img src={mantralogo} alt="mantra" />
          <p>
            2.5 OM
            <span>$18</span>
          </p>
        </div>

        <SubmitButton
          text="Claim Key"
          icon={<Import width={16} height={16} color={colors.textprimary} />}
          sxstyles={{
            padding: "0.625rem",
            borderRadius: "0.375rem",
            backgroundColor: colors.success,
          }}
          onclick={() => {}}
        />
      </div>
    </section>
  );
}
