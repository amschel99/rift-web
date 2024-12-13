import { useEffect, useCallback, useState, JSX } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { LockOutlined } from "@mui/icons-material";
import { useTabs } from "../../hooks/tabs";
import { useSnackbar } from "../../hooks/snackbar";
import { fetchMyKeys, keyType } from "../../utils/api/keys";
import { walletBalance } from "../../utils/api/wallet";
import { AppDrawer, draweraction } from "../../components/global/AppDrawer";
import { MySecrets, SharedSecrets } from "../../components/Secrets";
import { WalletBalance } from "../WalletBalance";
import { ResponsiveAppBar } from "../Appbar";
import { Import, Receive, Send, Share } from "../../assets/icons";
import "../../styles/components/tabs/vault.css";

export const VaultTab = (): JSX.Element => {
  const { initData } = useLaunchParams();

  const { switchtab } = useTabs();
  const { showsuccesssnack, showerrorsnack } = useSnackbar();

  const [appDrawerOpen, setAppDrawerOpen] = useState<boolean>(false);
  const [accBalance, setAccBalance] = useState<number>(0.0);
  const [mykeys, setMyKeys] = useState<keyType[]>([]);
  const [action, setAction] = useState<draweraction>("send");

  let walletAddress = localStorage.getItem("address");

  const onSend = () => {
    setAction("send");
    setAppDrawerOpen(true);
  };

  const onShare = () => {
    setAction("share");
    setAppDrawerOpen(true);
  };

  const onCopyAddr = () => {
    navigator.clipboard.writeText(walletAddress as string);
    showsuccesssnack("Wallet address copied to clipboard");
  };

  const onImportKey = () => {
    setAction("import");
    setAppDrawerOpen(true);
  };

  const getMyKeys = useCallback(async () => {
    let token: string | null = localStorage.getItem("token");

    const { isOk, keys } = await fetchMyKeys(token as string);

    if (isOk) {
      let parsedkeys: keyType[] = keys.keys.map((_key) => JSON.parse(_key));

      setMyKeys(parsedkeys);
    } else {
      showerrorsnack("Unable to get your keys");
    }
  }, []);

  const getWalletBalance = useCallback(async () => {
    let access: string | null = localStorage.getItem("token");

    const { balance } = await walletBalance(access as string);
    setAccBalance(Number(balance));
  }, []);

  useEffect(() => {
    getWalletBalance();
    getMyKeys();
  }, []);

  return (
    <section id="vaulttab">
      <ResponsiveAppBar
        username={initData?.user?.username}
        profileImage={initData?.user?.photoUrl}
        walletAddress={walletAddress as string}
      />

      {/* <div id="appctr"> */}
      <div>
        <WalletBalance balInEth={accBalance} />

        <div className="actions actions01">
          <button className="send" onClick={onSend}>
            <Send />
            <span>Send</span>
          </button>

          <button className="receive" onClick={onCopyAddr}>
            <Receive />
            <span>Receive</span>
          </button>

          <button className="share" onClick={onShare}>
            <Share width={16} height={18} />
            <span>Share</span>
          </button>
        </div>

        <div className="actions actions02">
          <button className="sendfromtoken" onClick={onImportKey}>
            <Import width={22} height={22} />
            <span>Import Secret</span>
          </button>

          <button onClick={() => switchtab("security")}>
            <LockOutlined />
            <span>Security</span>
          </button>
        </div>

        <MySecrets secretsLs={mykeys} />

        <SharedSecrets secretsLs={mykeys} />
      </div>
      {/* </div> */}

      <AppDrawer
        action={action}
        drawerOpen={appDrawerOpen}
        setDrawerOpen={setAppDrawerOpen}
      />
    </section>
  );
};
