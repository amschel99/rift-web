import { JSX, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "../../hooks/snackbar";
import { useAppDrawer } from "../../hooks/drawer";
import {
  getLaunchPadStores,
  launchPadStoreSubscribe,
} from "../../utils/api/quvault/launchpad";
import { formatDateToStr } from "../../utils/dates";
import { getPstTokenBalance } from "../../utils/api/quvault/psttokens";
import { SubmitButton } from "../global/Buttons";
import { FaIcon } from "../../assets/faicon";
import { colors } from "../../constants";
import "../../styles/components/drawer/launchpadsubscribe.scss";

export const LaunchPadSubscribe = (): JSX.Element => {
  const { linkUrl } = useAppDrawer(); // linkUrl -> store-id {store?.id}
  const { showerrorsnack, showsuccesssnack } = useSnackbar();

  const [subScribeAmount, setSubscribeAmount] = useState<string>("");

  const { data: launchPaddata } = useQuery({
    queryKey: ["launchpad"],
    queryFn: getLaunchPadStores,
  });

  const selectstore = launchPaddata?.data?.find(
    (_store) => _store?.id == linkUrl
  );

  const { data: pstBalance, isFetching: pstBalLoading } = useQuery({
    queryKey: ["tokenbalance"],
    queryFn: () => getPstTokenBalance(selectstore?.token_address as string),
  });

  const { mutate: initStoreSubscribe, isPending: subscribeLoading } =
    useMutation({
      mutationFn: () =>
        launchPadStoreSubscribe(linkUrl as string, Number(subScribeAmount)),
      onMutate: () => {
        showsuccesssnack(
          `Please wait, subscribing to ${selectstore?.symbol.substring(
            0,
            selectstore?.symbol.length / 2
          )}...`
        );
      },
      onSuccess: (res) => {
        if (res?.status == 400) {
          showerrorsnack("An error occurred, Insufficient Balance.");
        } else {
          showsuccesssnack(
            `Successfully subscribed to ${selectstore?.symbol.substring(
              0,
              selectstore?.symbol.length / 2
            )}...`
          );
        }
      },
    });

  return (
    <div id="launchpadsubscribe">
      <div className="img_name">
        <img src={selectstore?.logo_url} alt={selectstore?.store_name} />

        <p>
          {selectstore?.store_name} <span>{selectstore?.merchant_email}</span>
        </p>
      </div>
      <div className="storedetail">
        <p className="detail">
          Symbol <span>{selectstore?.symbol}</span>
        </p>
        <p className="detail">
          Decimals <span>18</span>
        </p>
        <p className="detail">
          Blockchain <span>{selectstore?.blockchain}</span>
        </p>
        <p className="detail">
          Price <span>${selectstore?.price}</span>
        </p>
        <p className="detail">
          Total Supply <span>{selectstore?.total_supply}</span>
        </p>
        <p className="detail">
          Offered At
          <span>{formatDateToStr(selectstore?.offered_at as string)}</span>
        </p>
        <p className="detail">
          Presale% <span>{selectstore?.presale_percentage}%</span>
        </p>
        <p className="detail">
          Liquidity% <span>{selectstore?.liquidity_percentage}%</span>
        </p>
        <p className="detail">
          Merchant% <span>{selectstore?.merchant_percentage}%</span>
        </p>
        <p className="detail">
          APY <span>{selectstore?.apy}%</span>
        </p>
        <p className="detail">
          Margin% <span>{selectstore?.margin_percentage}%</span>
        </p>
        <p className="detail">
          Unlocking Condition <span>{selectstore?.unlocking_condition}%</span>
        </p>
        <p className="detail">
          Reversal Condition <span>{selectstore?.reversal_condition}</span>
        </p>
      </div>

      <div className="input_submit">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Amount 0.5"
          value={subScribeAmount}
          onChange={(e) => setSubscribeAmount(e.target.value)}
        />
        <SubmitButton
          text="Subscribe"
          icon={
            <FaIcon
              faIcon={faCirclePlus}
              color={
                subScribeAmount == "" ||
                pstBalLoading ||
                Number(subScribeAmount) >= Number(pstBalance?.data)
                  ? colors.textsecondary
                  : colors.textprimary
              }
            />
          }
          sxstyles={{
            marginTop: "0.5rem",
            padding: "0.625rem",
            borderRadius: "0.375rem",
            backgroundColor:
              subScribeAmount == "" ||
              pstBalLoading ||
              Number(subScribeAmount) >= Number(pstBalance?.data) ||
              subscribeLoading
                ? colors.divider
                : colors.success,
          }}
          isDisabled={
            subScribeAmount == "" ||
            pstBalLoading ||
            Number(subScribeAmount) >= Number(pstBalance?.data) ||
            subscribeLoading
          }
          isLoading={subscribeLoading}
          onclick={initStoreSubscribe}
        />
      </div>
    </div>
  );
};
