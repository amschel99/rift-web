import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

import { forceClearCacheAndRefresh } from "@/utils/auto-update";
import { IoChevronForward, IoCloseOutline } from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";
import { Shield } from "lucide-react";
import {
  IoArrowUpCircle,
  IoArrowDownCircle,
  IoWalletOutline,
  IoReceiptOutline,
  IoCashOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAddCircleOutline,
  IoSwapHorizontalOutline,
} from "react-icons/io5";
import { useDisclosure } from "@/hooks/use-disclosure";
import useKYCGuard from "@/hooks/use-kyc-guard";
import KYCRequiredModal from "@/components/kyc/KYCRequiredModal";
import useBaseUSDCBalance, {
  SupportedCurrency,
} from "@/hooks/data/use-base-usdc-balance";
import useCountryDetection from "@/hooks/data/use-country-detection";
import useAnalaytics from "@/hooks/use-analytics";
import useOnrampOrders from "@/hooks/data/use-onramp-orders";
import useWithdrawalOrders from "@/hooks/data/use-withdrawal-orders";
import useOnchainHistory from "@/hooks/data/use-onchain-history";
import { useDeposits } from "@/hooks/data/use-deposits";
import CurrencySelector, {
  Currency,
  SUPPORTED_CURRENCIES,
} from "@/components/ui/currency-selector";
import AdvancedModeToggle, {
  useAdvancedMode,
} from "@/components/ui/advanced-mode-toggle";
import HistoryTabs from "@/components/ui/history-tabs";
import ViewAllModal from "@/components/ui/view-all-modal";
import OnrampOrderCard from "@/components/ui/onramp-order-card";
import WithdrawalCard from "@/components/ui/withdrawal-card";
import OnchainTransactionCard from "@/components/ui/onchain-transaction-card";
import { OnchainDepositCard } from "@/components/ui/onchain-deposit-card";
import { Skeleton } from "@/components/ui/skeleton";
import RedirectLinks from "@/features/redirectlinks";
import { ReceiveDrawer } from "@/features/receive/ReceiveDrawer";
import { SendDrawer } from "@/features/send/SendDrawer";
import ActionButton from "./components/ActionButton";
import { usePlatformDetection } from "@/utils/platform";
import { backButton } from "@telegram-apps/sdk-react";
import { formatNumberWithCommas } from "@/lib/utils";
import { toast } from "sonner";
import useDesktopDetection from "@/hooks/use-desktop-detection";
import DesktopPageLayout from "@/components/layouts/desktop-page-layout";
import RiftLoader from "@/components/ui/rift-loader";
import useWalletAuth from "@/hooks/wallet/use-wallet-auth";
import useWalletRecovery from "@/hooks/wallet/use-wallet-recovery";

export default function Home() {
  const navigate = useNavigate();
  const { logEvent } = useAnalaytics();
  const { isTelegram } = usePlatformDetection();
  const isDesktop = useDesktopDetection();
  const receive_disclosure = useDisclosure();
  const send_disclosure = useDisclosure();
  const { checkKYC, showKYCModal, closeKYCModal, featureName, isUnderReview } =
    useKYCGuard();

  // Recovery warning
  const { userQuery } = useWalletAuth();
  const hasPassword = !!userQuery?.data?.externalId;
  const userIdentifier = userQuery?.data?.phoneNumber || userQuery?.data?.email;
  const userIdentifierType: "phone" | "email" | undefined = userQuery?.data?.phoneNumber
    ? "phone"
    : userQuery?.data?.email
    ? "email"
    : undefined;

  const {
    recoveryMethodsQuery,
    recoveryOptionsByIdentifierQuery,
    myRecoveryMethodsQuery,
  } = useWalletRecovery({
    externalId: userQuery?.data?.externalId,
    identifier: !hasPassword ? userIdentifier : undefined,
    identifierType: !hasPassword ? userIdentifierType : undefined,
  });

  const recoveryEmail = myRecoveryMethodsQuery.data?.recovery?.email
    || (hasPassword
      ? recoveryMethodsQuery.data?.recoveryOptions?.email
      : recoveryOptionsByIdentifierQuery.data?.recoveryOptions?.email);
  const recoveryPhone = myRecoveryMethodsQuery.data?.recovery?.phoneNumber
    || (hasPassword
      ? recoveryMethodsQuery.data?.recoveryOptions?.phone
      : recoveryOptionsByIdentifierQuery.data?.recoveryOptions?.phone);

  const hasNoRecovery = !recoveryEmail && !recoveryPhone;
  const recoveryDataLoaded =
    myRecoveryMethodsQuery.isFetched ||
    recoveryMethodsQuery.isFetched ||
    recoveryOptionsByIdentifierQuery.isFetched;

  const [recoveryDismissed, setRecoveryDismissed] = useState(() => {
    const dismissed = localStorage.getItem("recovery_warning_dismissed");
    if (!dismissed) return false;
    // Re-show after 24 hours
    return Date.now() - parseInt(dismissed, 10) < 24 * 60 * 60 * 1000;
  });

  const dismissRecoveryWarning = () => {
    localStorage.setItem("recovery_warning_dismissed", Date.now().toString());
    setRecoveryDismissed(true);
  };

  const showRecoveryWarning = recoveryDataLoaded && hasNoRecovery && !recoveryDismissed;

  // Detect user's country and currency based on IP
  const { data: countryInfo, isLoading: countryLoading } =
    useCountryDetection();

  // Currency state - initialize with stored or detected currency
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem("selected_currency");
    if (stored) {
      const currency = SUPPORTED_CURRENCIES.find((c) => c.code === stored);
      if (currency) return currency;
    }
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === "USD") ||
      SUPPORTED_CURRENCIES[0]
    );
  });

  // Update selected currency when country is detected (only on first load)
  useEffect(() => {
    if (countryInfo && !countryLoading) {
      const stored = localStorage.getItem("selected_currency");
      // Only auto-set if user hasn't manually selected one
      if (!stored) {
        const detectedCurrency = SUPPORTED_CURRENCIES.find(
          (c) => c.code === countryInfo.currency
        );
        if (detectedCurrency) {
          setSelectedCurrency(detectedCurrency);
          localStorage.setItem("selected_currency", detectedCurrency.code);
        }
      }
    }
  }, [countryInfo, countryLoading]);

  // Save to localStorage when currency changes
  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem("selected_currency", currency.code);
    logEvent("CURRENCY_CHANGED", {
      currency: currency.code,
      currency_name: currency.name,
    });
  };

  // Fetch balance with selected currency
  const { data: BASE_USDC_BALANCE, isLoading: BASE_USDC_LOADING } =
    useBaseUSDCBalance({
      currency: selectedCurrency.code as SupportedCurrency,
    });

  // Advanced mode state
  const { isAdvanced, setIsAdvanced } = useAdvancedMode();

  // Balance visibility state
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Simple mode data
  const { data: ONRAMP_ORDERS, isLoading: ONRAMP_LOADING } = useOnrampOrders();
  const { data: WITHDRAWAL_ORDERS, isLoading: WITHDRAWALS_LOADING } =
    useWithdrawalOrders();
  const { data: DEPOSITS, isLoading: DEPOSITS_LOADING } = useDeposits();

  // Only fetch onchain data in advanced mode
  const { data: ONCHAIN_TRANSACTIONS, isLoading: ONCHAIN_LOADING } =
    useOnchainHistory();

  // Modal states for viewing all items
  const [showAllDeposits, setShowAllDeposits] = useState(false);
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
  const [showAllOnchain, setShowAllOnchain] = useState(false);

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

  useEffect(() => {
    if (isTelegram) {
      if (backButton.isSupported()) {
        backButton.mount();
      }

      if (backButton.isVisible()) {
        backButton.hide();
      }

      return () => {
        backButton.unmount();
      };
    }
  }, [isTelegram]);

  const content = (
    <>
      {/* Sticky Header - fixed at top (only on mobile) */}
      {!isDesktop && (
        <div className="flex-shrink-0 z-40 bg-surface backdrop-blur-sm border-b border-surface-alt">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <img src="/rift.png" alt="Rift" className="w-10 h-10" />
              <span className="text-lg font-semibold text-text-default">
                Rift
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AdvancedModeToggle
                isAdvanced={isAdvanced}
                onToggle={setIsAdvanced}
              />
              <CurrencySelector
                selectedCurrency={selectedCurrency.code}
                onCurrencyChange={handleCurrencyChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header - Binance-style */}
      {isDesktop && (
        <div className="flex-shrink-0 z-40 bg-white border-b border-gray-200">
          <div className="w-full px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back</p>
              </div>
              <div className="flex items-center gap-3">
                <AdvancedModeToggle
                  isAdvanced={isAdvanced}
                  onToggle={setIsAdvanced}
                />
                <CurrencySelector
                  selectedCurrency={selectedCurrency.code}
                  onCurrencyChange={handleCurrencyChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <motion.div
        initial={{ x: 4, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${
          isDesktop ? "p-8" : "p-4 pb-6"
        }`}
      >
        {isDesktop ? (
          <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Balance Card */}
            <div
              id="balance-section"
              className="bg-gradient-to-br from-accent-primary to-teal-700 rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-medium text-white/70">Total Balance</p>
                    <button
                      onClick={() => {
                        setIsBalanceVisible(!isBalanceVisible);
                        logEvent("BALANCE_VISIBILITY_TOGGLED", {
                          visible: !isBalanceVisible,
                        });
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      title={isBalanceVisible ? "Hide balance" : "Show balance"}
                    >
                      {isBalanceVisible ? (
                        <IoEyeOutline className="w-4 h-4 text-white/60" />
                      ) : (
                        <IoEyeOffOutline className="w-4 h-4 text-white/60" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        forceClearCacheAndRefresh();
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      title="Reload app"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5 text-white/60" />
                    </button>
                  </div>
                  <h1 className="text-5xl font-bold text-white">
                    {BASE_USDC_LOADING || countryLoading ? (
                      <RiftLoader message="Loading balance..." />
                    ) : !BASE_USDC_BALANCE ? (
                      <Skeleton className="h-12 w-40 inline-block" />
                    ) : isBalanceVisible ? (
                      `${formatNumberWithCommas(BASE_USDC_BALANCE.localAmount)} ${
                        selectedCurrency.code
                      }`
                    ) : (
                      `**** ${selectedCurrency.code}`
                    )}
                  </h1>
                  {BASE_USDC_BALANCE && isBalanceVisible && selectedCurrency.code !== "USD" && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-white/70">${BASE_USDC_BALANCE.usdcAmount.toFixed(2)} USD</span>
                      <IoSwapHorizontalOutline className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">1 USD = {BASE_USDC_BALANCE.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency.code}</span>
                    </div>
                  )}
                </div>
                <button
                  id="topup-button"
                  onClick={() => {
                    logEvent("TOPUP_BUTTON_CLICKED");
                    navigate("/app/request?type=topup");
                  }}
                  className="px-8 py-4 bg-white text-accent-primary rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors shadow-md"
                >
                  Top Up
                </button>
              </div>
            </div>

            {/* Recovery Warning Banner */}
            <AnimatePresence>
              {showRecoveryWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4.5 h-4.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900">
                        No recovery method set up
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        You risk losing access to your account. Add a recovery email or phone number.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/app/profile")}
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-xl hover:bg-amber-700 transition-colors flex-shrink-0"
                    >
                      Set Up
                    </button>
                    <button
                      onClick={dismissRecoveryWarning}
                      className="p-1 text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
                    >
                      <IoCloseOutline className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {isAdvanced && (
              <div className="grid grid-cols-5 gap-3">
                <SendDrawer
                  {...send_disclosure}
                  beforeOpen={() => checkKYC("sending crypto")}
                  renderTrigger={() => (
                    <button className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary transition-colors">
                        <IoArrowUpCircle className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Wallet</span>
                    </button>
                  )}
                />

                <ReceiveDrawer
                  {...receive_disclosure}
                  renderTrigger={() => (
                    <button className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary transition-colors">
                        <IoArrowDownCircle className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Address</span>
                    </button>
                  )}
                />

                <button
                  onClick={() => {
                    if (!checkKYC("withdrawals")) return;
                    logEvent("WITHDRAW_BUTTON_CLICKED");
                    navigate("/app/withdraw");
                  }}
                  className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary transition-colors">
                    <IoWalletOutline className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Withdraw</span>
                </button>

                <button
                  onClick={() => {
                    if (!checkKYC("payment requests")) return;
                    logEvent("REQUEST_BUTTON_CLICKED");
                    navigate("/app/request?type=request");
                  }}
                  className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary transition-colors">
                    <IoReceiptOutline className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Request</span>
                </button>

                <button
                  onClick={() => {
                    if (!checkKYC("sending payments")) return;
                    logEvent("SEND_BUTTON_CLICKED");
                    navigate("/app/pay");
                  }}
                  className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary transition-colors">
                    <IoCashOutline className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Pay</span>
                </button>
              </div>
            )}

            {/* History Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
            <div id="history-section" className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <HistoryTabs
                onrampOrders={ONRAMP_ORDERS}
                withdrawalOrders={WITHDRAWAL_ORDERS}
                onchainTransactions={ONCHAIN_TRANSACTIONS}
                deposits={DEPOSITS}
                onrampLoading={ONRAMP_LOADING}
                withdrawalsLoading={WITHDRAWALS_LOADING}
                onchainLoading={ONCHAIN_LOADING}
                depositsLoading={DEPOSITS_LOADING}
                onViewAllDeposits={() => setShowAllDeposits(true)}
                onViewAllWithdrawals={() => setShowAllWithdrawals(true)}
                onViewAllOnchain={() => setShowAllOnchain(true)}
                isAdvancedMode={isAdvanced}
                onWithdrawClick={() => {
                  if (!checkKYC("withdrawals")) return;
                  logEvent("WITHDRAW_BUTTON_CLICKED");
                  navigate("/app/withdraw");
                }}
                onRequestClick={() => {
                  if (!checkKYC("payment requests")) return;
                  logEvent("REQUEST_BUTTON_CLICKED");
                  navigate("/app/request?type=request");
                }}
                onPayClick={() => {
                  if (!checkKYC("sending payments")) return;
                  logEvent("SEND_BUTTON_CLICKED");
                  navigate("/app/pay");
                }}
              />
            </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Balance Card */}
            <div
              id="balance-section"
              className="mt-6 mb-8"
            >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <p className="text-xs text-text-subtle">Total Balance</p>
                <button
                  onClick={() => {
                    setIsBalanceVisible(!isBalanceVisible);
                    logEvent("BALANCE_VISIBILITY_TOGGLED", {
                      visible: !isBalanceVisible,
                    });
                  }}
                  className="p-1 hover:bg-surface-subtle rounded-lg transition-colors"
                  title={isBalanceVisible ? "Hide balance" : "Show balance"}
                >
                  {isBalanceVisible ? (
                    <IoEyeOutline className="w-4 h-4 text-text-subtle" />
                  ) : (
                    <IoEyeOffOutline className="w-4 h-4 text-text-subtle" />
                  )}
                </button>
                <button
                  onClick={() => {
                    forceClearCacheAndRefresh();
                  }}
                  className="p-1 hover:bg-surface-subtle rounded-lg transition-colors"
                  title="Reload app"
                >
                  <FiRefreshCw className="w-3.5 h-3.5 text-text-subtle" />
                </button>
              </div>
              <h1 className="text-4xl">
                {BASE_USDC_LOADING || countryLoading ? (
                  <RiftLoader message="Loading balance..." />
                ) : !BASE_USDC_BALANCE ? (
                  <Skeleton className="h-10 w-32 inline-block" />
                ) : isBalanceVisible ? (
                  `${formatNumberWithCommas(BASE_USDC_BALANCE.localAmount)} ${
                    selectedCurrency.code
                  }`
                ) : (
                  `**** ${selectedCurrency.code}`
                )}
              </h1>
              {BASE_USDC_BALANCE && isBalanceVisible && selectedCurrency.code !== "USD" && (
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  <span className="text-2xs text-text-subtle">${BASE_USDC_BALANCE.usdcAmount.toFixed(2)} USD</span>
                  <IoSwapHorizontalOutline className="w-2.5 h-2.5 text-text-subtle/50" />
                  <span className="text-2xs text-text-subtle">1 USD = {BASE_USDC_BALANCE.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency.code}</span>
                </div>
              )}
              <div className="mt-4">
                <button
                  id="topup-button"
                  onClick={() => {
                    logEvent("TOPUP_BUTTON_CLICKED");
                    navigate("/app/request?type=topup");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <IoAddCircleOutline className="w-4 h-4" />
                  Top Up
                </button>
              </div>
            </div>
            </div>

            {/* Recovery Warning Banner (Mobile) */}
            <AnimatePresence>
              {showRecoveryWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-amber-900">
                        No recovery method
                      </p>
                      <p className="text-2xs text-amber-700">
                        You could lose access to your account
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/app/profile")}
                      className="px-2.5 py-1 bg-amber-600 text-white text-2xs font-medium rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0"
                    >
                      Set Up
                    </button>
                    <button
                      onClick={dismissRecoveryWarning}
                      className="p-0.5 text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
                    >
                      <IoCloseOutline className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Action Buttons - Show only in advanced mode */}
            {isAdvanced && (
              <div className="w-full mb-8">
                {/* First row */}
                <div className="w-full flex flex-row items-center justify-center gap-2 mb-3">
                  <SendDrawer
                    {...send_disclosure}
                    beforeOpen={() => checkKYC("sending crypto")}
                    renderTrigger={() => (
                      <ActionButton
                        icon={
                          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                            <IoArrowUpCircle className="w-6 h-6 text-accent-primary" />
                          </div>
                        }
                        title="Wallet"
                        className="w-[30%]"
                      />
                    )}
                  />

                  <ReceiveDrawer
                    {...receive_disclosure}
                    renderTrigger={() => (
                      <ActionButton
                        icon={
                          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                            <IoArrowDownCircle className="w-6 h-6 text-accent-primary" />
                          </div>
                        }
                        title="Address"
                        className="w-[30%]"
                      />
                    )}
                  />

                  <ActionButton
                    icon={
                      <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                        <IoWalletOutline className="w-6 h-6 text-accent-primary" />
                      </div>
                    }
                    title="Withdraw"
                    className="w-[30%]"
                    onClick={() => {
                      if (!checkKYC("withdrawals")) return;
                      logEvent("WITHDRAW_BUTTON_CLICKED");
                      navigate("/app/withdraw");
                    }}
                  />
                </div>

                {/* Second row */}
                <div className="w-full flex flex-row items-center justify-center gap-2">
                  <ActionButton
                    icon={
                      <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                        <IoReceiptOutline className="w-6 h-6 text-accent-primary" />
                      </div>
                    }
                    title="Request"
                    className={
                      selectedCurrency.code === "KES" ? "w-[30%]" : "w-[45%]"
                    }
                    onClick={() => {
                      if (!checkKYC("payment requests")) return;
                      logEvent("REQUEST_BUTTON_CLICKED");
                      navigate("/app/request?type=request");
                    }}
                  />

                  <ActionButton
                    icon={
                      <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                        <IoCashOutline className="w-6 h-6 text-accent-primary" />
                      </div>
                    }
                    title="Pay"
                    className="w-[30%]"
                    onClick={() => {
                      if (!checkKYC("sending payments")) return;
                      logEvent("SEND_BUTTON_CLICKED");
                      navigate("/app/pay");
                    }}
                  />
                </div>
              </div>
            )}

            {/* Mobile History Tabs */}
            <div id="history-section" className="w-full">
              <HistoryTabs
                onrampOrders={ONRAMP_ORDERS}
                withdrawalOrders={WITHDRAWAL_ORDERS}
                onchainTransactions={ONCHAIN_TRANSACTIONS}
                deposits={DEPOSITS}
                onrampLoading={ONRAMP_LOADING}
                withdrawalsLoading={WITHDRAWALS_LOADING}
                onchainLoading={ONCHAIN_LOADING}
                depositsLoading={DEPOSITS_LOADING}
                onViewAllDeposits={() => setShowAllDeposits(true)}
                onViewAllWithdrawals={() => setShowAllWithdrawals(true)}
                onViewAllOnchain={() => setShowAllOnchain(true)}
                isAdvancedMode={isAdvanced}
                onWithdrawClick={() => {
                  if (!checkKYC("withdrawals")) return;
                  logEvent("WITHDRAW_BUTTON_CLICKED");
                  navigate("/app/withdraw");
                }}
                onRequestClick={() => {
                  if (!checkKYC("payment requests")) return;
                  logEvent("REQUEST_BUTTON_CLICKED");
                  navigate("/app/request?type=request");
                }}
                onPayClick={() => {
                  if (!checkKYC("sending payments")) return;
                  logEvent("SEND_BUTTON_CLICKED");
                  navigate("/app/pay");
                }}
              />
            </div>
          </>
        )}

        <RedirectLinks
          isOpen={isRedirectDrawerOpen}
          onClose={handleCloseRedirectDrawer}
          redirectType={redirectType}
        />
      </motion.div>

      {/* View All Modals */}
      <ViewAllModal
        isOpen={showAllDeposits}
        onClose={() => setShowAllDeposits(false)}
        title="All Deposits"
        description={`${
          (ONRAMP_ORDERS?.length || 0) + (DEPOSITS?.length || 0)
        } deposits`}
      >
        <div className="space-y-6">
          {/* Mobile Money Deposits Section */}
          <div>
            <h3 className="text-sm font-medium text-text-default mb-3">
              Mobile Money Deposits
            </h3>
            {ONRAMP_ORDERS && ONRAMP_ORDERS.length > 0 ? (
              <div className="space-y-3">
                {ONRAMP_ORDERS.map((order) => (
                  <OnrampOrderCard key={order.transactionCode} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-subtle">
                <p className="text-sm">No mobile money deposits found</p>
              </div>
            )}
          </div>

          {/* USDC Deposits Section */}
          <div>
            <h3 className="text-sm font-medium text-text-default mb-3">
              USDC Deposits
            </h3>
            {DEPOSITS && DEPOSITS.length > 0 ? (
              <div className="space-y-3">
                {DEPOSITS.map((deposit) => (
                  <OnchainDepositCard key={deposit.id} deposit={deposit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-subtle">
                <p className="text-sm">No USDC deposits found</p>
              </div>
            )}
          </div>
        </div>
      </ViewAllModal>

      <ViewAllModal
        isOpen={showAllWithdrawals}
        onClose={() => setShowAllWithdrawals(false)}
        title="All Mobile Money Withdrawals"
        description={`${WITHDRAWAL_ORDERS?.length || 0} withdrawals`}
      >
        {WITHDRAWAL_ORDERS && WITHDRAWAL_ORDERS.length > 0 ? (
          <div className="space-y-3">
            {WITHDRAWAL_ORDERS.map((order) => (
              <WithdrawalCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-subtle">
            <p className="text-sm">No mobile money withdrawals found</p>
          </div>
        )}
      </ViewAllModal>

      <ViewAllModal
        isOpen={showAllOnchain}
        onClose={() => setShowAllOnchain(false)}
        title="All Transfers"
        description={`${ONCHAIN_TRANSACTIONS?.length || 0} transactions`}
      >
        {ONCHAIN_TRANSACTIONS && ONCHAIN_TRANSACTIONS.length > 0 ? (
          <div className="space-y-3">
            {ONCHAIN_TRANSACTIONS.map((transaction) => (
              <OnchainTransactionCard
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-subtle">
            <p className="text-sm">No transfers found</p>
          </div>
        )}
      </ViewAllModal>

      {/* KYC Required Modal */}
      <KYCRequiredModal
        isOpen={showKYCModal}
        onClose={closeKYCModal}
        featureName={featureName}
        isUnderReview={isUnderReview}
      />
    </>
  );

  return (
    <div className="h-full flex flex-col">
      {content}
    </div>
  );
}
