import { JSX, useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";
import { useTabs } from "../../hooks/tabs";
import { useAppDrawer } from "../../hooks/drawer";
import email from "../../assets/images/icons/email.png";
import phone from "../../assets/images/icons/phone.png";
import { Email, Phone } from "../../assets/icons/security";
import { Trash } from "../../assets/icons/actions";
import { colors } from "../../constants";
import "../../styles/pages/security/recovery.scss";

export default function RecoverySetup(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();
  const { openAppDrawerWithKey } = useAppDrawer();

  const useremail = localStorage.getItem("useremail");
  const displayemailuname = useremail?.split("@")[0];
  const displayemaildomain = useremail?.split("@")[1];
  const userphone = localStorage.getItem("userphone");

  const goBack = () => {
    switchtab("security");
    navigate("/app");
  };

  const goToEmail = () => {
    navigate("/security/email");
  };

  const goToPhone = () => {
    navigate("/security/phone");
  };

  const deleteEmail = () => {
    openAppDrawerWithKey("deleteemail", useremail as string, "delete-email");
  };

  const deletePhone = () => {
    openAppDrawerWithKey("deletephone", userphone as string, "delete-phone");
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
    <section id="recoverysetup">
      <div className="images">
        <img src={email} alt="email" />
        <div className="divider"></div>
        <img src={phone} alt="phone" />
      </div>

      <p className="description">Setup Account Recovery</p>
      <p className="cdescription">
        You can use your recovery phone / email to restore your Stratosphere
        account
      </p>

      <div className="devices">
        {useremail !== null && (
          <div className="device email_device">
            <div className="icon_detail">
              <span className="icons">
                <Email width={16} height={16} color={colors.textprimary} />
              </span>

              <p>
                <>
                  {displayemailuname?.substring(0, 5)}***{displayemaildomain}
                </>
                <span>{navigator.userAgent?.substring(0, 32)}...</span>
              </p>
            </div>

            <button onClick={deleteEmail}>
              <Trash color={colors.danger} />
            </button>
          </div>
        )}

        {userphone !== null && (
          <div className="device">
            <div className="icon_detail">
              <span className="icons">
                <Phone width={16} height={16} color={colors.textprimary} />
              </span>
              <p>
                <>
                  {userphone?.substring(0, 3)}***
                  {userphone?.substring(
                    userphone?.length / 2,
                    userphone?.length / 2 + 3
                  )}
                </>
                <span>{navigator.userAgent?.substring(0, 32)}...</span>
              </p>
            </div>

            <button onClick={deletePhone}>
              <Trash color={colors.danger} />
            </button>
          </div>
        )}
      </div>

      <div className="actions">
        <div className="recover_action" onClick={goToEmail}>
          <p>Add an Email Address</p>

          <span>
            <Email width={16} height={16} color={colors.textsecondary} />
          </span>
        </div>

        <div className="recover_action" onClick={goToPhone}>
          <p>Add a Phone Number</p>

          <span>
            <Phone width={16} height={16} color={colors.textsecondary} />
          </span>
        </div>
      </div>
    </section>
  );
}
