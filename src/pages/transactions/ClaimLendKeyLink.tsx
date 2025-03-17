import { JSX } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
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
      <p className="title">
        You have received a lent Web2 <span>OPENAI</span> Key
      </p>
    </section>
  );
}
