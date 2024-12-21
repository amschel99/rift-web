import { JSX, useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useTabs } from "../../hooks/tabs";
import { colors } from "../../constants";
import { ComingSoon } from "../../assets/icons";
import friendsduel from "../../assets/images/labs/friendsduel.png";
import stratocover from "../../assets/images/labs/stratocover.jpg";
import mantracover from "../../assets/images/labs/mantracover.jpeg";
import telemarket from "../../assets/images/labs/telemarket.png";
import "../../styles/components/tabs/labstab.css";

export const LabsTab = (): JSX.Element => {
  const { switchtab } = useTabs();

  if (backButton.isMounted()) {
    backButton.onClick(() => {
      switchtab("vault");
    });
  }

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
      backButton.show();
    }

    return () => {
      backButton.unmount();
    };
  }, []);

  return (
    <section id="labstab">
      <p className="title">Labs</p>

      <div className="projects">
        <div className="project">
          <img src={stratocover} alt="stratosphere" className="project_cover" />

          <div className="project_logo">
            <img src={friendsduel} alt="friendsduel" />
          </div>

          <div className="about">
            <p>
              StratosphereX
              <ComingSoon width={16} height={18} color={colors.textsecondary} />
            </p>

            <span>A DEX for interoperability trading.</span>

            <p className="project_category">DEX</p>
          </div>
        </div>

        <div className="project">
          <img src={mantracover} alt="stratosphere" className="project_cover" />

          <div className="project_logo">
            <img src={telemarket} alt="friendsduel" />
          </div>

          <div className="about">
            <p>
              Mantra Staking
              <ComingSoon width={16} height={18} color={colors.textsecondary} />
            </p>

            <span>Crypto staking for the modern world.</span>

            <p className="project_category">Crypto Staking</p>
          </div>
        </div>
      </div>
    </section>
  );
};
