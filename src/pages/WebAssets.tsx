import { JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useBackButton } from "../hooks/backbutton";
import { useTabs } from "../hooks/tabs";
import { fetchMyKeys, keyType } from "../utils/api/keys";
import { Secrets } from "../components/web2/Secrets";
import { ImportSecret } from "../components/web2/ImportSecret";
import "../styles/pages/webassets.scss";

export default function WebAssets(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const { data: mykeys } = useQuery({
    queryKey: ["secrets"],
    queryFn: fetchMyKeys,
  });

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section id="webassets">
      <Secrets mykeys={mykeys as keyType[]} />
      <ImportSecret />
    </section>
  );
}
