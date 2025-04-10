import { JSX, useState, MouseEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import {
  faChevronDown,
  faCircleInfo,
  faCircleArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { formatNumber, numberFormat } from "../../utils/formatters";
import { useBackButton } from "../../hooks/backbutton";
import { useTransactionStatus } from "../../hooks/txstatus";
import { useSnackbar } from "../../hooks/snackbar";
import { useTabs } from "../../hooks/tabs";
import { PopOver } from "../../components/global/PopOver";
import { sendEth, sendWbera } from "../../utils/api/wallet";
import { BottomButtonContainer } from "../../components/Bottom";
import { SubmitButton } from "../../components/global/Buttons";
import { OutlinedTextInput } from "../../components/global/Inputs";
import { FaIcon } from "../../assets/faicon";
import { colors } from "../../constants";
import ethlogo from "../../assets/images/eth.png";
import usdclogo from "../../assets/images/labs/usdc.png";
import beralogo from "../../assets/images/icons/bera.webp";
import "../../styles/pages/sendcrypto.scss";

export default function SendCrypto(): JSX.Element {
  const { srccurrency, intent } = useParams();
  const navigate = useNavigate();
  const { switchtab } = useTabs();
  const { showerrorsnack } = useSnackbar();
  const { showTxStatusBar, txStatusBarVisible, transactionStatus } =
    useTransactionStatus();

  const [depositAsset, setDepositAsset] = useState<string>(
    srccurrency as string
  );
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [sendAmnt, setSendAmnt] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  const ethbalance = localStorage.getItem("ethbal");
  const usdcbalance = localStorage.getItem("usdcbal");
  const wberabalance = localStorage.getItem("WBERAbal");
  const prev_page = localStorage.getItem("prev_page");

  const availableBalance =
    depositAsset == "WBERA"
      ? wberabalance
      : depositAsset == "ETH"
      ? ethbalance
      : depositAsset == "USDC"
      ? usdcbalance
      : "0";

  const { mutate: mutateSendEth, isError: ethError } = useMutation({
    mutationFn: () =>
      sendEth(receiverAddress, sendAmnt, intent as string)
        .then(() => {})
        .catch(() => {
          setProcessing(false);
        }),
  });

  const { mutate: mutateSendWbera, isError: wberaError } = useMutation({
    mutationFn: () =>
      sendWbera(receiverAddress, sendAmnt, intent as string)
        .then(() => {})
        .catch(() => {
          setProcessing(false);
        }),
  });

  const errorInSendAmount = (): boolean => {
    if (sendAmnt == "") return false;
    else if (Number(sendAmnt) >= Number(availableBalance)) return true;
    else return false;
  };

  const onSendCrypto = async () => {
    if (receiverAddress == "" || sendAmnt == "") {
      showerrorsnack(`Enter a valid ${depositAsset} address & amount`);
      return;
    }

    if (depositAsset == "ETH") {
      setProcessing(true);

      mutateSendEth();

      if (ethError) {
        showerrorsnack("An unexpected error occurred");
        setProcessing(false);
      } else {
        showTxStatusBar(
          "PENDING",
          `Send ${numberFormat(Number(sendAmnt))} ${depositAsset}`
        );
      }

      return;
    }

    if (depositAsset == "WBERA") {
      setProcessing(true);

      mutateSendWbera();

      if (wberaError) {
        showerrorsnack("An unexpected error occurred");
        setProcessing(false);
      } else {
        showTxStatusBar(
          "PENDING",
          `Send ${numberFormat(Number(sendAmnt))} ${depositAsset}`
        );
      }

      return;
    }
  };

  const openAssetPopOver = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

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

  return (
    <div id="sendasset">
      <p className="info">
        <FaIcon faIcon={faCircleInfo} color={colors.danger} fontsize={12} />
        Send {depositAsset} to another address
      </p>

      <p className="info_desc">
        To send {depositAsset} to another address, simply provide an address and
        amount. Amount will be deducted from your balance.
      </p>

      <div className="assetselector" onClick={openAssetPopOver}>
        <div className="img_desc">
          <img
            src={
              depositAsset == "WBERA"
                ? beralogo
                : depositAsset == "ETH"
                ? ethlogo
                : depositAsset == "USDC"
                ? usdclogo
                : ethlogo
            }
            alt="asset"
          />

          <p className="desc">
            {depositAsset}
            <span>
              {depositAsset == "WBERA"
                ? "Berachain"
                : depositAsset == "ETH"
                ? "Ethereum"
                : depositAsset == "USDC"
                ? "USD Coin"
                : "Unknown"}
            </span>
          </p>
        </div>

        <span>
          <FaIcon faIcon={faChevronDown} color={colors.textsecondary} />
        </span>
      </div>
      <PopOver anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
        <div className="select_assets p-2 space-y-1">
          <div
            className="img_desc flex items-center gap-2 p-2 hover:bg-[#2a2a2a] rounded-lg cursor-pointer"
            onClick={() => {
              setDepositAsset("WBERA");
              setAnchorEl(null);
            }}
          >
            <img src={beralogo} alt="asset" className="w-8 h-8 rounded-full" />
            <p className="desc text-sm text-[#f6f7f9]">
              WBERA <br />{" "}
              <span className="text-xs text-gray-400">Berachain</span>
            </p>
          </div>

          <div
            className="img_desc flex items-center gap-2 p-2 hover:bg-[#2a2a2a] rounded-lg cursor-pointer"
            onClick={() => {
              setDepositAsset("ETH");
              setAnchorEl(null);
            }}
          >
            <img src={ethlogo} alt="asset" className="w-8 h-8 rounded-full" />
            <p className="desc text-sm text-[#f6f7f9]">
              ETH <br /> <span className="text-xs text-gray-400">Ethereum</span>
            </p>
          </div>

          <div
            className="img_desc flex items-center gap-2 p-2 hover:bg-[#2a2a2a] rounded-lg cursor-pointer"
            onClick={() => {
              setDepositAsset("USDC");
              setAnchorEl(null);
            }}
          >
            <img src={usdclogo} alt="asset" className="w-8 h-8 rounded-full" />
            <p className="desc text-sm text-[#f6f7f9]">
              USDC <br />{" "}
              <span className="text-xs text-gray-400">USD Coin</span>
            </p>
          </div>
        </div>
      </PopOver>

      <OutlinedTextInput
        inputType="text"
        placeholder="address"
        inputlabalel={`${depositAsset} Address`}
        inputState={receiverAddress}
        setInputState={setReceiverAddress}
      />

      <OutlinedTextInput
        inputType="number"
        placeholder="0.05"
        inputlabalel="Amount"
        inputState={sendAmnt}
        setInputState={setSendAmnt}
        hasError={errorInSendAmount()}
      />

      <p className="availablebalance">
        {formatNumber(Number(availableBalance))} {depositAsset}
      </p>

      <BottomButtonContainer>
        <SubmitButton
          text="Send"
          icon={
            <FaIcon
              faIcon={faCircleArrowUp}
              color={
                processing ||
                receiverAddress == "" ||
                sendAmnt == "" ||
                Number(sendAmnt) > Number(availableBalance) ||
                (txStatusBarVisible && transactionStatus == "PENDING")
                  ? colors.textsecondary
                  : colors.textprimary
              }
            />
          }
          isDisabled={
            processing ||
            receiverAddress == "" ||
            sendAmnt == "" ||
            Number(sendAmnt) > Number(availableBalance) ||
            (txStatusBarVisible && transactionStatus == "PENDING")
          }
          isLoading={
            processing || (txStatusBarVisible && transactionStatus == "PENDING")
          }
          onclick={onSendCrypto}
        />
      </BottomButtonContainer>
    </div>
  );
}
