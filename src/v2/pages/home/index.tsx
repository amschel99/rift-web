import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { IoArrowUpCircle, IoArrowDownCircle } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import useChainsBalance from "@/hooks/wallet/use-chains-balances";
import useOwnedTokens from "@/hooks/data/use-owned-tokens";
import useAnalaytics from "@/hooks/use-analytics";
import SendToKnown from "@/features/send/known";
import ReceiveCrypto from "@/features/receive";
import RedirectLinks from "@/features/redirectlinks";
import BuyCrypto from "@/features/buycrypto";
import ActionButton from "./components/ActionButton";
import TokenCard from "./components/TokenCard";
import { TokenSketleton } from "./components/TokenSketleton";
import { formatNumberUsd } from "@/lib/utils";

export default function Home() {
  const { data: AGGREGATE_BALANCE, isPending: AGGREGATE_BALANCE_LOADING } =
    useChainsBalance();
  const { data: OWNED_TOKENS, isPending: OWNED_TOKENS_PENDING } =
    useOwnedTokens();
  const { logEvent } = useAnalaytics();

  const [isRedirectDrawerOpen, setIsRedirectDrawerOpen] = useState(false);
  const [redirectType, setRedirectType] = useState<
    "RECEIVE-FROM-COLLECT-LINK" | "SEND-TO-REQUEST-LINK"
  >("RECEIVE-FROM-COLLECT-LINK");

  const handleCloseRedirectDrawer = useCallback(() => {
    setIsRedirectDrawerOpen(false);
  }, []);

  const checkRedirectObjects = useCallback(() => {
    const collectobjectb64 = localStorage.getItem("collectobject");
    const requestobjectb64 = localStorage.getItem("requestobject");

    if (collectobjectb64 !== null) {
      setRedirectType("RECEIVE-FROM-COLLECT-LINK");
      setIsRedirectDrawerOpen(true);
    } else if (requestobjectb64 !== null) {
      setRedirectType("SEND-TO-REQUEST-LINK");
      setIsRedirectDrawerOpen(true);
    } else {
      setIsRedirectDrawerOpen(false);
    }
  }, []);

  useEffect(() => {
    checkRedirectObjects();

    const interval = setInterval(checkRedirectObjects, 2000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "collectobject" || e.key === "requestobject") {
        checkRedirectObjects();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    logEvent("PAGE_VISIT_HOME");
  }, []);

  return (
    <motion.div
      initial={{ x: 4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full h-full overflow-y-auto mb-18 p-4"
    >
      <div className="text-center mt-8 mb-4">
        <h1 className="text-5xl font-medium mb-2">
          {formatNumberUsd(AGGREGATE_BALANCE ?? 0)}
        </h1>
      </div>

      <div className="w-full flex flex-row items-center justify-center gap-3 mb-6">
        <SendToKnown
          renderTrigger={() => (
            <ActionButton
              icon={<IoArrowUpCircle className="w-6 h-6" />}
              title="Send"
            />
          )}
        />

        <ReceiveCrypto
          renderTrigger={() => (
            <ActionButton
              icon={<IoArrowDownCircle className="w-6 h-6" />}
              title="Receive"
            />
          )}
        />

        <BuyCrypto
          renderTrigger={() => (
            <ActionButton
              icon={<FaMoneyBillTransfer className="w-6 h-6" />}
              title="Buy"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        {OWNED_TOKENS_PENDING ? (
          <>
            <TokenSketleton />
            <TokenSketleton />
            <TokenSketleton />
          </>
        ) : (
          OWNED_TOKENS?.map((_token, idx) => (
            <TokenCard
              key={_token?.id + idx}
              tokenid={_token?.id}
              chain={_token?.chain_id}
            />
          ))
        )}
      </div>

      <RedirectLinks
        isOpen={isRedirectDrawerOpen}
        onClose={handleCloseRedirectDrawer}
        redirectType={redirectType}
      />
    </motion.div>
  );
}
