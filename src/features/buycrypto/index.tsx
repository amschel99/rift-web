import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { MpesaSTKInitiateResponse } from "@stratosphere-network/wallet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FaArrowsRotate } from "react-icons/fa6";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Input } from "@/components/ui/input";
import useOnRamp from "@/hooks/wallet/use-on-ramp";
import useCoinGecko, { cgTokens } from "@/hooks/data/use-coin-gecko";
import ActionButton from "@/components/ui/action-button";
import { IoMdArrowRoundBack } from "react-icons/io";
import useWalletAuth from "@/hooks/wallet/use-wallet-auth";

const buyFormSchema = z.object({
  amountkes: z.union([
    z.string().min(1, { message: "Please enter an amount" }),
    z.number().min(1, { message: "Please enter an amount" }),
  ]),
  cryptoqty: z.union([z.string().optional(), z.number().optional()]),
  phonenumber: z
    .string()
    .min(5, { message: "Please enter your M-pesa phone number" }),
});

type buyTokens = "BERA-USDC" | "ETH" | "POL-USDC" | "WBERA";

export default function BuyCrypto() {
  const navigate = useNavigate();
  const { handleSubmit, setValue, control, getValues } = useForm<
    z.infer<typeof buyFormSchema>
  >({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      amountkes: "",
      cryptoqty: "",
      phonenumber: "",
    },
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userQuery } = useWalletAuth();
  const { supportedtokensprices, getAssetImage, getTokenPriceUsd } =
    useCoinGecko();
  const { data: USER_INFO } = userQuery;
  const [selectedCrypto, setSelectedCrypto] = useState<buyTokens>("BERA-USDC");
  const [transactionIds, setTransactionIds] = useState<{
    checkoutRequestId?: string;
    merchantId?: string;
  }>({});

  const address = localStorage.getItem("address");

  // init onramp
  const { onrampmutation, USD_EXCHANGE_RATE } = useOnRamp({
    onSuccess: (ONRAMP_RES: MpesaSTKInitiateResponse) => {
      setTransactionIds({
        checkoutRequestId: ONRAMP_RES?.data?.checkoutRequestID,
        merchantId: ONRAMP_RES?.data?.merchantRequestID,
      });
    },
    onError: () => {
      toast.error("The transaction could not be completed");
    },
  });

  // transaction status
  const { onrampstatusquery } = useOnRamp({
    checkoutRequestId: transactionIds.checkoutRequestId,
    merchantId: transactionIds.merchantId,
  });

  // status query results
  useEffect(() => {
    if (onrampstatusquery?.data?.data?.status === "success") {
      toast.success("The transaction was completed successfully");
      setTransactionIds({});
    } else if (onrampstatusquery?.data?.data?.status === "failed") {
      toast.error("The transaction could not be completed");
      setTransactionIds({});
    }
  }, [onrampstatusquery?.data?.data?.status]);

  const goBack = () => {
    navigate(-1);
  };

  const submitBuyCrypto = () => {
    const formValues = getValues();
    const phonenumber = formValues.phonenumber;
    const amountkes = formValues.amountkes;

    const tx_args = {
      amount: Number(amountkes),
      cryptoAsset: selectedCrypto,
      cryptoWalletAddress: String(address),
      externalReference: USER_INFO?.user?.externalId as string,
      phone: phonenumber,
    };

    onrampmutation.mutate(tx_args);
  };

  return (
    <div className="w-full h-full p-4">
      <button
        onClick={goBack}
        className="p-1 mb-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Go back"
      >
        <IoMdArrowRoundBack className="text-2xl text-primary" />
      </button>

      <div
        onClick={onOpen}
        className="p-2 rounded-xl w-full flex flex-row items-center justify-between mb-4 bg-secondary border-1 border-[rgba(255,255,255,0.1)]"
      >
        <span className="flex flex-row items-center justify-start gap-2">
          <img
            src={getAssetImage(selectedCrypto)}
            alt="usdc"
            className="w-10 h-10"
          />
          <p className="text-md font-semibold">{selectedCrypto}</p>
        </span>

        <Button
          variant="outline"
          className="bg-transparent border-1 border-[rgba(255,255,255,0.1)]"
        >
          <FaArrowsRotate />
        </Button>
      </div>

      <form
        className="flex flex-col gap-4 mb-4"
        onSubmit={handleSubmit(submitBuyCrypto)}
      >
        <div className="flex flex-col gap-1.5">
          <Controller
            control={control}
            name="amountkes"
            render={({ field, fieldState }) => (
              <div className="w-full">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount (KES)
                </label>

                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  className="py-6 mt-2"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);

                    const calculatedCrypto = (
                      value /
                      (getTokenPriceUsd(
                        selectedCrypto,
                        supportedtokensprices?.data as cgTokens
                      ) *
                        USD_EXCHANGE_RATE)
                    ).toFixed(2);
                    setValue("cryptoqty", calculatedCrypto);
                  }}
                />

                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name="cryptoqty"
            render={({ field, fieldState }) => (
              <div className="w-full">
                <label htmlFor="quantity" className="text-sm font-medium mt-4">
                  or Quantity {selectedCrypto}
                </label>
                <Input
                  id="quantity"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Quantity"
                  className="py-6 mt-2"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);

                    const calculatedAmount = (
                      value *
                      getTokenPriceUsd(
                        selectedCrypto,
                        supportedtokensprices?.data as cgTokens
                      ) *
                      USD_EXCHANGE_RATE
                    ).toFixed(2);
                    setValue("amountkes", calculatedAmount);
                  }}
                />

                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name="phonenumber"
            render={({ field, fieldState }) => (
              <div className="w-full">
                <label htmlFor="phone" className="text-sm font-medium mt-4">
                  Enter your M-pesa Phone Number
                </label>
                <Input
                  id="phone"
                  type="text"
                  inputMode="tel"
                  placeholder="07-000-000-00"
                  className="py-6 mt-2"
                  {...field}
                />

                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <ActionButton
          type="submit"
          variant={"secondary"}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md sm:w-full px-4"
        >
          Buy
        </ActionButton>
      </form>

      <p className="text-sm text-muted-foreground mb-4 font-bold">
        1 {selectedCrypto} ={" "}
        {(
          getTokenPriceUsd(
            selectedCrypto,
            supportedtokensprices?.data as cgTokens
          ) * USD_EXCHANGE_RATE
        ).toFixed(2)}{" "}
        KES
      </p>

      <Drawer
        open={isOpen}
        onClose={onClose}
        onOpenChange={(open) => {
          if (open) {
            onOpen();
          } else {
            onClose();
          }
        }}
      >
        <DrawerContent className="h-1/2">
          <DrawerHeader>
            <DrawerTitle>Select the crypto you want to buy</DrawerTitle>
            <DrawerDescription className="hidden">
              Onramping/Buy Crypto
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-4 p-4">
            {["BERA-USDC", "ETH", "POL-USDC", "WBERA"].map((_asset, idx) => (
              <div
                onClick={() => {
                  setSelectedCrypto(_asset as buyTokens);
                  onClose();
                }}
                key={_asset + idx}
                className="flex flex-row items-center justify-start gap-2"
              >
                <img
                  src={getAssetImage(_asset as buyTokens)}
                  alt="usdc"
                  className="w-10 h-10"
                />
                <p className="flex flex-col text-md font-semibold">
                  {_asset}
                  <span className="text-sm text-gray-500">{_asset}</span>
                </p>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
