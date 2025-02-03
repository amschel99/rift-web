import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SOCKET } from "../../utils/api/config";
import { spendOnBehalf } from "../../utils/api/wallet";
import { getEthUsdVal } from "../../utils/ethusd";
import { Loading } from "../../assets/animations";
import { useSnackbar } from "../../hooks/snackbar";
import { useAppDrawer } from "../../hooks/drawer";
import { SendFromToken } from "../../assets/icons";
import { colors } from "../../constants";
import foreignspend from "../../assets/images/obhehalfspend.png";
import "../../styles/components/forms.scss";

function base64ToString(base64: string | null): string {
  try {
    if (!base64) throw new Error("Base64 string is missing");
    return decodeURIComponent(escape(atob(base64)));
  } catch (error) {
    return "Invalid value";
  }
}

// foreign spend - send eth to my address from shared link
export const SendEthFromToken = (): JSX.Element => {
  const navigate = useNavigate();
  const { showsuccesssnack, showerrorsnack } = useSnackbar();
  const { closeAppDrawer } = useAppDrawer();

  let utxoVal = localStorage.getItem("utxoVal");

  const { data: ethusdval, isPending } = useQuery({
    queryKey: ["ethusd"],
    queryFn: getEthUsdVal,
  });

  const [disableReceive, setdisableReceive] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [httpSuccess, sethttpSuccess] = useState<boolean>(false);

  const collectValue = (
    Number(base64ToString(utxoVal)) * Number(ethusdval)
  ).toFixed(2);

  let access = localStorage.getItem("token");
  let utxoId = localStorage.getItem("utxoId");
  let utxoIntent = localStorage.getItem("utxoIntent");
  let address = localStorage.getItem("address");

  const { mutate: mutateCollectEth } = useMutation({
    mutationFn: () =>
      spendOnBehalf(
        access as string,
        address as string,
        utxoId as string,
        utxoIntent as string
      ),
    onSuccess: (res) => {
      localStorage.removeItem("utxoId");

      if (res.status == 200) {
        localStorage.removeItem("utxoId");
        sethttpSuccess(true);
        showsuccesssnack("Please wait for the transaction...");
      } else if (res.status == 403) {
        localStorage.removeItem("utxoId");
        showerrorsnack("This link has expired");
        closeAppDrawer();
      } else if (res.status == 404) {
        localStorage.removeItem("utxoId");
        showerrorsnack("This link has been used");
        closeAppDrawer();
      } else {
        localStorage.removeItem("utxoId");
        showerrorsnack("An unexpected error occurred");
        closeAppDrawer();
      }
    },
    onError: () => {
      localStorage.removeItem("utxoId");
      showerrorsnack("An unexpected error occurred");
      closeAppDrawer();
    },
  });

  useEffect(() => {
    if (httpSuccess) {
      localStorage.removeItem("utxoId");

      SOCKET.on("TXConfirmed", () => {
        localStorage.removeItem("utxoId");

        setProcessing(false);
        showsuccesssnack(
          `Successfully collected ${base64ToString(
            localStorage.getItem("utxoVal") as string
          )} ETH`
        );

        closeAppDrawer();
        navigate("/app");
      });
      SOCKET.on("TXFailed", () => {});

      return () => {
        SOCKET.off("TXConfirmed");
        SOCKET.off("TXFailed");
      };
    }
  }, [httpSuccess]);

  return (
    <div id="sendethfromtoken">
      <img src={foreignspend} alt="Foreign spend" />

      <p>
        Click 'Receive' to collect&nbsp;
        {isPending ? "- - -" : `${collectValue} USD`}
      </p>

      <button
        disabled={disableReceive}
        onClick={() => {
          setdisableReceive(true);
          mutateCollectEth();
        }}
      >
        {processing || disableReceive ? (
          <Loading width="1.5rem" height="1.5rem" />
        ) : (
          <>
            Receive <SendFromToken color={colors.textprimary} />
          </>
        )}
      </button>
    </div>
  );
};
