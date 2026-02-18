import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { ChevronDown, SearchIcon } from "lucide-react";
import { FiArrowLeft, FiMail, FiSmartphone } from "react-icons/fi";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDisclosure } from "@/hooks/use-disclosure";
import useWalletRecovery from "@/hooks/wallet/use-wallet-recovery";
import useDesktopDetection from "@/hooks/use-desktop-detection";
import RecoveryContextProvider, {
  RECOVERY_SCHEMA_TYPE,
  recoverySchema,
} from "./context";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import ActionButton from "@/components/ui/action-button";
import PasswordConfirmCreate from "./components/ConfirmCreate";
import PasswordConfirmUpdate from "./components/ConfirmUpdate";
import COUNTRY_PHONES from "@/lib/country-phones";
import useWalletAuth from "@/hooks/wallet/use-wallet-auth";

function RecoveryCtr() {
  const navigate = useNavigate();
  const isDesktop = useDesktopDetection();
  const { method: recovery_method } = useParams() as {
    method: "phone" | "email";
  };
  const confirm_create_disclosure = useDisclosure();
  const confirm_update_disclosure = useDisclosure();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { userQuery } = useWalletAuth();

  // Determine if user has a password (externalId users) or not (phone/email users)
  const hasPassword = !!userQuery?.data?.externalId;

  // User's current login identifier (for recovery lookup)
  const userIdentifier =
    userQuery?.data?.phoneNumber || userQuery?.data?.email;
  const userIdentifierType: "phone" | "email" = userQuery?.data?.phoneNumber
    ? "phone"
    : "email";

  const {
    recoveryMethodsQuery,
    recoveryOptionsByIdentifierQuery,
    createRecoveryWithJwtMutation,
    addRecoveryMethodWithJwtMutation,
    updateRecoveryMethodWithJwtMutation,
    myRecoveryMethodsQuery,
    sendOtpMutation,
  } = useWalletRecovery({
    externalId: userQuery?.data?.externalId,
    identifier: !hasPassword ? userIdentifier : undefined,
    identifierType: !hasPassword ? userIdentifierType : undefined,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const form = useForm<RECOVERY_SCHEMA_TYPE>({
    resolver: zodResolver(recoverySchema),
  });

  const COUNTRY = form.watch("countryCode");
  const EMAIL_ADDR = form.watch("emailAddress");
  const PHONE_NUMBER = form.watch("phoneNumber");
  const PHONE_SEARCH_FILTER = form.watch("phonesearchfilter");

  const onCancel = () => {
    navigate("/app/profile");
  };

  const countryDetails = useMemo(() => {
    const country = COUNTRY_PHONES.find((c) => c.code == COUNTRY);
    return country ?? COUNTRY_PHONES[0];
  }, [COUNTRY]);

  const country_phones = useMemo(() => {
    if (
      !PHONE_SEARCH_FILTER ||
      PHONE_SEARCH_FILTER?.trim().length == 0 ||
      PHONE_SEARCH_FILTER == ""
    ) {
      return COUNTRY_PHONES;
    }

    const filtered = COUNTRY_PHONES?.filter(
      (_countryphone) =>
        _countryphone.countryname
          .toLocaleLowerCase()
          .includes(PHONE_SEARCH_FILTER.toLocaleLowerCase()) ||
        _countryphone.code.includes(PHONE_SEARCH_FILTER)
    );
    return filtered ?? [];
  }, [PHONE_SEARCH_FILTER]);

  // Determine what recovery methods already exist
  // For non-password users, use recoveryOptionsByIdentifierQuery (same as profile page)
  // with myRecoveryMethodsQuery as fallback
  const existingEmail = hasPassword
    ? !!recoveryMethodsQuery.data?.recoveryOptions?.email
    : !!(
        recoveryOptionsByIdentifierQuery.data?.recoveryOptions?.email ||
        myRecoveryMethodsQuery.data?.recovery?.email
      );

  const existingPhone = hasPassword
    ? !!recoveryMethodsQuery.data?.recoveryOptions?.phone
    : !!(
        recoveryOptionsByIdentifierQuery.data?.recoveryOptions?.phone ||
        myRecoveryMethodsQuery.data?.recovery?.phoneNumber
      );

  const hasAnyRecovery = existingEmail || existingPhone;
  const hasCurrentMethod =
    recovery_method === "email" ? existingEmail : existingPhone;

  const isLoadingRecoveryData = hasPassword
    ? recoveryMethodsQuery.isLoading
    : recoveryOptionsByIdentifierQuery.isLoading && myRecoveryMethodsQuery.isLoading;

  const getValue = () => {
    if (recovery_method === "email") return EMAIL_ADDR?.trim() || "";
    let num = PHONE_NUMBER?.startsWith("0")
      ? PHONE_NUMBER.trim().replace("0", "")
      : PHONE_NUMBER?.trim() || "";
    return `${COUNTRY || "+254"}${num}`;
  };

  // Send OTP to user's current login phone/email for verification
  const handleSendOtp = async () => {
    if (!userIdentifier) return;
    setIsSendingOtp(true);
    try {
      await sendOtpMutation.mutateAsync({
        identifier: userIdentifier,
        type: userIdentifierType,
      });
      setOtpStep(true);
      toast.success(
        `Verification code sent to your ${userIdentifierType === "phone" ? "phone" : "email"}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Save recovery method with OTP code (for phone/email users)
  const handleVerifyAndSave = async () => {
    const value = getValue();
    if (!value || !otpCode) return;

    const identifierFields =
      userIdentifierType === "phone"
        ? { phoneNumber: userIdentifier }
        : { email: userIdentifier };

    setIsSaving(true);
    try {
      if (hasCurrentMethod) {
        // Method already exists → UPDATE it
        await updateRecoveryMethodWithJwtMutation.mutateAsync({
          method:
            recovery_method === "email" ? "emailRecovery" : "phoneRecovery",
          value,
          otpCode,
          ...identifierFields,
        });
      } else if (hasAnyRecovery) {
        // Recovery exists but this specific method doesn't → ADD it
        await addRecoveryMethodWithJwtMutation.mutateAsync({
          method:
            recovery_method === "email" ? "emailRecovery" : "phoneRecovery",
          value,
          otpCode,
          ...identifierFields,
        });
      } else {
        // No recovery at all → CREATE
        await createRecoveryWithJwtMutation.mutateAsync({
          emailRecovery: recovery_method === "email" ? value : undefined,
          phoneRecovery: recovery_method === "phone" ? value : undefined,
          otpCode,
          ...identifierFields,
        });
      }
      toast.success("Recovery method saved successfully");
      navigate("/app/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to save recovery method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (hasPassword) {
      // Password users: show password confirmation drawer
      if (hasAnyRecovery) {
        confirm_update_disclosure.onOpen();
      } else {
        confirm_create_disclosure.onOpen();
      }
    } else {
      // Phone/email users: send OTP first, then verify
      handleSendOtp();
    }
  };

  const isInputEmpty =
    recovery_method === "phone" ? !PHONE_NUMBER?.trim() : !EMAIL_ADDR?.trim();

  return (
    <motion.div
      initial={{ x: 4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full h-full bg-app-background"
    >
      <div
        className={`flex flex-col h-full ${
          isDesktop ? "max-w-md mx-auto justify-center px-6" : "p-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-text-default" />
          </button>
          <div>
            <h1
              className={`${
                isDesktop ? "text-2xl" : "text-lg"
              } font-semibold text-text-default`}
            >
              Account Recovery
            </h1>
            <p className="text-sm text-text-subtle">
              Add a backup{" "}
              {recovery_method === "phone" ? "phone number" : "email address"}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* OTP Verification Step (for phone/email users) */}
          {otpStep && !hasPassword ? (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                  {userIdentifierType === "phone" ? (
                    <FiSmartphone className="w-6 h-6 text-accent-primary" />
                  ) : (
                    <FiMail className="w-6 h-6 text-accent-primary" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-text-default mb-1">
                  Verify your identity
                </h2>
                <p className="text-sm text-text-subtle">
                  Enter the code sent to your{" "}
                  {userIdentifierType === "phone" ? "phone" : "email"}
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <InputOTP
                  value={otpCode}
                  onChange={setOtpCode}
                  maxLength={4}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full text-center text-sm text-accent-primary mb-6 disabled:opacity-50"
              >
                {isSendingOtp ? "Sending..." : "Resend code"}
              </button>

              <div className={isDesktop ? "flex gap-3 mt-2" : "mt-auto pb-4"}>
                <ActionButton
                  onClick={() => {
                    setOtpStep(false);
                    setOtpCode("");
                  }}
                  variant="ghost"
                  className={`rounded-2xl border border-gray-200 ${
                    isDesktop ? "flex-1" : "w-full mb-3"
                  }`}
                >
                  Back
                </ActionButton>

                <ActionButton
                  variant="secondary"
                  disabled={otpCode.length < 4 || isSaving}
                  loading={isSaving}
                  onClick={handleVerifyAndSave}
                  className={`rounded-2xl ${isDesktop ? "flex-1" : "w-full"}`}
                >
                  Verify & Save
                </ActionButton>
              </div>
            </div>
          ) : (
            <>
              {/* Phone input */}
              {recovery_method == "phone" && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-text-default mb-1.5 block">
                    Recovery Phone Number
                  </label>
                  <div className="flex rounded-2xl border-2 border-gray-200 focus-within:border-accent-primary/40 transition-colors overflow-hidden bg-white">
                    <Controller
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => {
                        return (
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
                            <DrawerTrigger>
                              <div className="border-r border-gray-200 px-3 py-3.5 flex items-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors h-full">
                                <span className="text-base">
                                  {countryDetails.flag}
                                </span>
                                <span className="text-xs font-medium text-text-default">
                                  {countryDetails.code}
                                </span>
                                <ChevronDown className="w-3 h-3 text-text-subtle" />
                              </div>
                            </DrawerTrigger>
                            <DrawerContent className="min-h-fit h-[60vh]">
                              <DrawerHeader className="hidden">
                                <DrawerTitle>Country Code</DrawerTitle>
                                <DrawerDescription>
                                  Select country code
                                </DrawerDescription>
                              </DrawerHeader>

                              <div className="w-full flex items-center gap-2 px-3 py-3 bg-app-background border-b border-border">
                                <SearchIcon
                                  className="text-muted-foreground"
                                  size={18}
                                />
                                <input
                                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
                                  placeholder="Search..."
                                  value={PHONE_SEARCH_FILTER || ""}
                                  onChange={(e) =>
                                    form.setValue(
                                      "phonesearchfilter",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="w-full h-[50vh] p-4 pt-1 gap-3 overflow-scroll">
                                {country_phones?.map((country, idx) => {
                                  return (
                                    <div
                                      onClick={() => {
                                        field.onChange(country.code);
                                        onClose();
                                        form.setValue("phonesearchfilter", "");
                                      }}
                                      key={country.code + idx}
                                      className="w-full flex items-center justify-between py-3 cursor-pointer"
                                    >
                                      <p className="text-sm">
                                        {country.countryname}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <p>{country.flag}</p>
                                        <p className="text-sm font-medium">
                                          {country.code}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </DrawerContent>
                          </Drawer>
                        );
                      }}
                    />
                    <Controller
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => {
                        return (
                          <input
                            type="tel"
                            className="flex-1 px-3 py-3.5 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                            placeholder="Phone number"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        );
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-subtle mt-2">
                    This number will be used to recover your account
                  </p>
                </div>
              )}

              {/* Email input */}
              {recovery_method == "email" && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-text-default mb-1.5 block">
                    Recovery Email Address
                  </label>
                  <Controller
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => {
                      return (
                        <div className="flex items-center rounded-2xl px-4 py-3.5 bg-white border-2 border-gray-200 focus-within:border-accent-primary/40 transition-colors">
                          <FiMail className="w-4 h-4 text-text-subtle mr-3" />
                          <input
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            type="email"
                            inputMode="email"
                            placeholder="your-email@example.com"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                      );
                    }}
                  />
                  <p className="text-xs text-text-subtle mt-2">
                    This email will be used to recover your account
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className={isDesktop ? "flex gap-3 mt-2" : "mt-auto pb-4"}>
                <ActionButton
                  onClick={onCancel}
                  variant="ghost"
                  className={`rounded-2xl border border-gray-200 ${
                    isDesktop ? "flex-1" : "w-full mb-3"
                  }`}
                >
                  Cancel
                </ActionButton>

                <ActionButton
                  variant="secondary"
                  disabled={isInputEmpty || isSaving || isSendingOtp || isLoadingRecoveryData}
                  loading={isSaving || isSendingOtp}
                  onClick={handleSave}
                  className={`rounded-2xl ${isDesktop ? "flex-1" : "w-full"}`}
                >
                  Save
                </ActionButton>
              </div>
            </>
          )}
        </div>

        {/* Password confirm drawers (only used for externalId/password users) */}
        {hasPassword && (
          <>
            <PasswordConfirmCreate
              {...confirm_create_disclosure}
              recovery_method={recovery_method}
              emailAddress={EMAIL_ADDR}
              countryCode={COUNTRY}
              phoneNumber={PHONE_NUMBER}
            />

            <PasswordConfirmUpdate
              {...confirm_update_disclosure}
              recovery_method={recovery_method}
              emailAddress={EMAIL_ADDR}
              countryCode={COUNTRY}
              phoneNumber={PHONE_NUMBER}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function Recovery() {
  return (
    <RecoveryContextProvider>
      <RecoveryCtr />
    </RecoveryContextProvider>
  );
}
