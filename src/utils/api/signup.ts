import { BASEURL, ENDPOINTS } from "./config";

// HTTP
export const signupUser = async (
  tgUsername: string,
  deviceToken: string,
  deviceName: string,
  otpCode: string
) => {
  let URL = BASEURL + ENDPOINTS.signup;

  await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      telegramId: tgUsername,
      password: tgUsername,
      deviceToken,
      deviceName,
      otpCode,
    }),
    headers: { "Content-Type": "application/json" },
  });
};
