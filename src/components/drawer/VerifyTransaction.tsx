import { JSX, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "@/utils/api/signup";
import { DigitsInput } from "../security/DigitsInput";
import { SubmitButton } from "../global/Buttons";
import { useSnackbar } from "@/hooks/snackbar";
import { useAppDrawer } from "@/hooks/drawer";
import "../../styles/components/drawer/verifytx.scss";

export const VerifyTransaction = (): JSX.Element => {
  const { showsuccesssnack, showerrorsnack } = useSnackbar();
  const { closeAppDrawer } = useAppDrawer();

  const [otpValue, setOTPValue] = useState<string>("");
  const [requestedOtp, setRequestedOtp] = useState<boolean>(false);

  const phoneNumber = localStorage.getItem("verifyphone") as string;

  const { mutate: mutateSendOtp, isPending: sendingOtp } = useMutation({
    mutationFn: () =>
      sendOtp(phoneNumber)
        .then(() => {
          showsuccesssnack("OTP Code sent successfully to your phone");
          setRequestedOtp(true);
        })
        .catch(() => {
          showerrorsnack("Failed to send OTP. Please try again.");
        }),
  });

  const { mutate: mutateVerifyOtp, isPending: verifyotppending } = useMutation({
    mutationFn: () =>
      verifyOtp(otpValue, phoneNumber)
        .then(() => {
          showsuccesssnack("OTP verified successfully");
          localStorage.setItem("txverified", "true");
          closeAppDrawer();
        })
        .catch(() => {
          showerrorsnack("Failed to verify, please try again");
          closeAppDrawer();
        }),
  });

  return (
    <div className="verifytransaction">
      <p className="verifymessage">
        Please request an OTP and verify to make sure its you performing this
        transaction
      </p>

      <DigitsInput
        setDigitVals={setOTPValue}
        message="Please enter the OTP we sent you"
      />

      <SubmitButton
        text={requestedOtp ? "Verify OTP" : "Request OTP"}
        sxstyles={{
          marginTop: "1rem",
          padding: "0.625rem",
          borderRadius: "0.5rem",
        }}
        onclick={requestedOtp ? mutateVerifyOtp : mutateSendOtp}
        isDisabled={sendingOtp || verifyotppending}
        isLoading={sendingOtp || verifyotppending}
      />
    </div>
  );
};
