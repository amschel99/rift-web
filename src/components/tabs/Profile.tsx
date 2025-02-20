import { JSX, useEffect } from "react";
import { useNavigate } from "react-router";
import { backButton, useLaunchParams } from "@telegram-apps/sdk-react";
import { Avatar } from "@mui/material";
import { useTabs } from "../../hooks/tabs";
import { colors } from "../../constants";
import refericon from "../../assets/images/icons/refer.png";
import premiumicon from "../../assets/images/icons/premium.png";
import depositicon from "../../assets/images/icons/lendto.png";
import accrecoveryicon from "../../assets/images/icons/acc-recovery.png";
import "../../styles/components/tabs/profile.scss";

export const Profile = (): JSX.Element => {
  const { initData } = useLaunchParams();
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  let ethAddr = localStorage.getItem("address");
  let btcAddr = localStorage.getItem("btcaddress");

  const onRefer = () => {
    navigate("/refer/unlock");
  };

  const onPremium = () => {
    navigate("/premiums");
  };

  const onDeposit = () => {
    navigate("/deposit");
  };

  const onRecovery = () => {
    navigate("/security/recover");
  };

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useEffect(() => {
    if (backButton.isSupported()) {
      backButton.mount();
      backButton.show();
    }

    if (backButton.isVisible()) {
      backButton.onClick(goBack);
    }

    return () => {
      backButton.offClick(goBack);
      backButton.unmount();
    };
  }, []);

  return (
    <div className="profiletab">
      <div className="pic_uname">
        <Avatar
          src={initData?.user?.photoUrl}
          alt={initData?.user?.username}
          sx={{
            width: 120,
            height: 120,
          }}
        />

        <div className="uname">
          <p style={{ color: colors.textprimary }}>
            Hi, {initData?.user?.username} 👋
          </p>
          <p className="uid">
            ID ~ {ethAddr?.substring(2, 6)}
            {btcAddr?.substring(2, 6)}
          </p>
        </div>
      </div>

      <div className="earn" onClick={onRefer}>
        <img src={refericon} alt="refer" />

        <p>
          Refer & Earn
          <span>Refer & earn 1 OM</span>
        </p>
      </div>

      <div className="earn" onClick={onPremium}>
        <img src={premiumicon} alt="refer" />

        <p>
          Premium
          <span>Explore Sphere premium</span>
        </p>
      </div>

      <div className="earn" onClick={onDeposit}>
        <img src={depositicon} alt="deposit" />

        <p>
          Deposit
          <span>Add funds to your wallet</span>
        </p>
      </div>

      <div className="earn" onClick={onRecovery}>
        <img src={accrecoveryicon} alt="account recoverys" />

        <p>
          Account Recovery
          <span>Setup a recovery method for your account</span>
        </p>
      </div>
    </div>
  );
};
