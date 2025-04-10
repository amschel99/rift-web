import { JSX, useState } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";

import { BorrowedSecret, LentSecret } from "../../components/lend/Secrets";
import "../../styles/pages/lendspend.scss";
import { ActivityChart } from "./ActivityChart";
export default function LendToUse(): JSX.Element {
  const navigate = useNavigate();
  const { switchtab } = useTabs();

  const [selector, setSelector] = useState<"lent" | "borrowed">("borrowed");

  const secretRevoked = localStorage.getItem("revokedsecret");

  const goBack = () => {
    switchtab("home");
    navigate("/");
  };

  const lendSecret = () => {
    navigate("/lend/secret/nil/nil");
  };

  useBackButton(goBack);
  //No need for first time lend info page

  // useEffect(() => {
  //   const firsttimelend = localStorage.getItem("firsttimelend");

  //   if (firsttimelend == null) {
  //     navigate("/lend/info");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <section
      id=""
      className="bg-[#0e0e0e] h-screen px-4 overflow-y-scroll pb-20"
    >
      <div className="mt-2">
        <h1 className="text-[#f6f7f9] text-xl font-bold">Lend Keys & Earn</h1>
        <span className="text-sm text-gray-400 mb-2">
          Lend out your idle Web2 keys securely
        </span>
        <div className="flex items-center justify-between my-2 gap-2">
          <div className="bg-[#212121] w-1/2 rounded-2xl h-24 flex flex-col items-center justify-center">
            <h1 className="text-[#32e15e] text-2xl font-bold my-2">$0.00</h1>
            <p className="text-gray-400 text-sm">Earnings</p>
          </div>
          <div className="bg-[#212121] w-1/2 rounded-2xl h-24 flex flex-col items-center justify-center">
            <h1 className="text-[#f41818] text-2xl font-bold my-2">$0.00</h1>
            <p className="text-gray-400 text-sm">Spending</p>
          </div>
        </div>
        <ActivityChart />
      </div>
      <div className="">
        <h1 className="text-[#f6f7f9] text-xl font-bold mt-4 mb-2">
          Lent Keys Activity
        </h1>
      </div>

      <div className="flex items-center gap-2 mb-2 justify-between bg-[#212121] border border-[#212121] p-2 px-2 rounded-2xl">
        <button
          className={`filter-btn ${
            selector === "borrowed"
              ? "bg-[#ffb386] border border-[#ffb386] p-2 rounded-xl flex items-center gap-2 text-sm w-1/2 justify-center"
              : "text-[#f6f7f9] flex items-center gap-2 text-sm"
          }`}
          onClick={() => setSelector("borrowed")}
        >
          Borrowed Keys
        </button>
        <button
          className={`filter-btn ${
            selector === "lent"
              ? "bg-[#ffb386] border border-[#ffb386] p-2 rounded-xl flex items-center gap-2 text-sm w-1/2 justify-center"
              : "text-[#f6f7f9] flex items-center gap-2 text-sm"
          }`}
          onClick={() => setSelector("lent")}
        >
          Lent Keys
        </button>
      </div>

      <div className="assets-container mt-4">
        {selector === "borrowed" ? (
          <div className="grid grid-cols-1 gap-4">
            <BorrowedSecret
              owner="example_owner"
              secret="BORR..."
              secretFee={10}
              secretType="AIRWALLEX"
            />
            <div className="flex items-center justify-center flex-col gap-2 py-10">
              <p className="text-gray-400 text-sm">
                You have not borrowed any keys yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="assets-grid space-y-4">
            {secretRevoked == null ? (
              <LentSecret
                borrower="amscelll"
                secret="L9P0..."
                secretType="POE"
                secretFee={0}
              />
            ) : (
              <div className="flex items-center justify-center flex-col gap-2 py-10">
                <p className="text-gray-400 text-sm">
                  You have not lent any keys yet.
                </p>
                <span className="text-gray-400 text-sm text-center">
                  Start lending your keys to earn passive income.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0e0e0e]">
        <button
          className="flex items-center gap-2 text-sm bg-[#ffb386] border border-[#ffb386] p-3 rounded-xl text-[#0e0e0e] w-full justify-center font-semibold"
          onClick={lendSecret}
        >
          Lend Keys
        </button>
      </div>
    </section>
  );
}
