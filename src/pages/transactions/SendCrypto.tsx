import { JSX } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";

export default function SendCrypto(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const prev_page = localStorage.getItem("prev_page");

  const goBack = () => {
    if (prev_page == null) {
      switchtab("home");
      navigate("/app");
    } else if (prev_page === "rewards") {
      switchtab("rewards");
      navigate("/app");
    } else if (prev_page === "send-options") {
      switchtab("sendcrypto");
      navigate("/app");
    } else {
      navigate(prev_page);
    }
  };

  useBackButton(goBack);

  return <section id="sendcrypto">send crypto here</section>;
}
