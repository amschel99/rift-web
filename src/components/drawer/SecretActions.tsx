import { JSX } from "react";
import { useNavigate } from "react-router";
import { useAppDrawer } from "../../hooks/drawer";
import { colors } from "../../constants";
import { Share, Stake } from "../../assets/icons/actions";
import "../../styles/components/drawer/secretactions.scss";

export const SecretActions = (): JSX.Element => {
  const navigate = useNavigate();
  const { secretPurpose, closeAppDrawer } = useAppDrawer();

  const onUseSecret = () => {
    // navigate to chatbot / get airwallex balances
    closeAppDrawer();
  };

  const onShareSecret = () => {
    // parameters -> secret: string, purpose: string
    // navigate(`/sharesecret/${secret}/${purpose}`);
    closeAppDrawer();
    navigate("/premiums");
  };

  return (
    <div className="secretactions">
      <p className="_title">Share & Use</p>
      <p className="_desc">
        You can use or share your&nbsp;
        <span>{secretPurpose == "OPENAI" ? "Poe" : "Airwallex"}</span> secret
      </p>

      <div className="actions">
        <button onClick={onUseSecret}>
          <span>
            Use
            <Stake width={6} height={11} color={colors.textprimary} />
          </span>
          Access&nbsp;
          {secretPurpose == "OPENAI"
            ? "a Poe chat interafce"
            : "your Airwallex balances"}
        </button>

        <div className="divider" />

        <button onClick={onShareSecret}>
          <span>
            Share <Share width={10} height={14} color={colors.textprimary} />
          </span>
          Grant others access to your&nbsp;
          {secretPurpose == "OPENAI" ? "Poe key" : "Airwallex key & balances"}
        </button>
      </div>
      <p className="mindesc">Upgrade to premium to share your secrets</p>
    </div>
  );
};
