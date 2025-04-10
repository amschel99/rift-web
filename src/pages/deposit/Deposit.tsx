import { JSX } from "react";
import { useNavigate } from "react-router";
import { faCircleArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
// import { SubmitButton } from "../../components/global/Buttons";

import { FaIcon } from "../../assets/faicon";
// import { colors } from "../../constants";
import "../../styles/pages/deposit/deposit.scss";

export default function Deposit(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  // const [depositTarget, setDepositTarget] = useState<"me" | "other">("me"); // Commented out target selection
  // const [depositMethod, setDepositMethod] = useState<"airwallex" | "external">(
  //   "external"
  // ); // Commented out method state, assuming 'external'

  const onDeposit = () => {
    // if (depositMethod == "external") { // Simplified logic
    navigate("/deposit-address");
    // } else {
    //   navigate(`/deposit-awx/${depositTarget}`);
    // }
  };

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  useBackButton(goBack);

  return (
    <section
      id=""
      className="bg-[#0e0e0e] h-screen px-4 pb-20 overflow-y-auto relative"
    >
      {/* <p className="text-xl text-[#f6f7f9] font-bold text-center mt-8">
        Choose a deposit target
      </p>
      <p className="text-sm text-gray-400 my-2 ">
        Where would you like to deposit funds ?
      </p>

      <div className="flex items-center justify-between mb-8 gap-4">
        <button
          className={`text-sm  flex items-center gap-1 p-2 rounded-2xl w-full justify-center ${
            depositTarget == "me"
              ? "bg-[#ffb386] text-[#000]"
              : "text-[#f6f7f9] bg-[#222222] "
          }`}
          onClick={() => setDepositTarget("me")}
        >
          <span>My Account</span>
        </button>

        <button
          className={`bg-[#222222] text-sm flex items-center gap-1 p-2 rounded-2xl w-full justify-center ${
            depositTarget == "other"
              ? "bg-[#ffb386] text-[#000]"
              : "text-[#f6f7f9] bg-[#222222]"
          }`}
          onClick={() => setDepositTarget("other")}
        >
          <span>Another Account</span>
        </button>
      </div> */}

      <p className="text-xl text-[#f6f7f9] font-bold text-center mt-8">
        {/* Choose a deposit method */}
        Deposit from External Network
      </p>

      <p className="text-sm text-gray-400 my-2 ">
        {/* How would you like to deposit funds ? */}
        Select an asset below to view your deposit address and required network.
      </p>

      {/* <div className="methods">
        <RadioButton
          title="Airwallex"
          description="Deposit from your Airwallex balances"
          ischecked={depositMethod == "airwallex"}
          onclick={() => setDepositMethod("airwallex")}
        />

        <RadioButton
          title="External Network"
          description="Deposit from an external network"
          ischecked={depositMethod == "external"}
          onclick={() => {
            setDepositMethod("external");
            // setDepositTarget("me"); // Target is always 'me' now
          }}
        />
      </div> */}

      {/* Spacer to push button down, as method selection is removed */}
      <div style={{ flexGrow: 1 }}></div>

      <button
        className="bg-[#ffb386] flex items-center gap-1 p-3 rounded-2xl w-full justify-center absolute bottom-10 left-4 right-4"
        onClick={onDeposit}
      >
        <span>Choose Asset to Deposit</span>
        <FaIcon faIcon={faCircleArrowUp} color={"#000"} />
      </button>

      {/* <SubmitButton
        text="Deposit Now"
        icon={<FaIcon faIcon={faCircleArrowUp} color={colors.textprimary} />}
        sxstyles={{
          width: "unset",
          position: "fixed",
          bottom: "1rem",
          left: "1rem",
          right: "1rem",
        }}
        onclick={onDeposit}
      /> */}
    </section>
  );
}

// const buttonstyles: CSSProperties = {
//   width: "48%",
//   padding: "0.375rem",
//   borderRadius: "2rem",
//   fontSize: "0.75rem",
//   fontWeight: "bold",
// };
