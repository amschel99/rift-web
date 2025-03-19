import { BASEURL, ENDPOINTS } from "./config";

export type keyType = {
  id: string;
  email: string;
  value: string;
  token: string;
  purpose: string; // "AIRWALLEX" | "OPENAI" | "POLYMARKET"
  url: string | null;
  nonce: string | null;
  expiresAt: string | null;
  locked: boolean;
  paymentValue: number;
  paymentCurrency: string;
  time: string | null;
  owner: string | null;
  ownerAdress: string | null;
  createdAt: string;
  updatedAt: string;
};

export type airWlxbalType = {
  available_amount: number;
  currency: string;
  pending_amount: number;
  reserved_amount: number;
  total_amount: number;
};

export const fetchMyKeys = async (): Promise<keyType[]> => {
  let token: string | null = localStorage.getItem("spheretoken");

  let URL = BASEURL + ENDPOINTS.getkeys;

  let res: Response = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token as string}`,
    },
  });

  return res?.json();
};

export const importKey = async (
  keyval: string,
  keyUtilType: string
): Promise<{ isOk: boolean }> => {
  let token: string | null = localStorage.getItem("spheretoken");
  const URL = BASEURL + ENDPOINTS.importkey;

  const keyObject = JSON.stringify({ value: keyval });

  let res: Response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      key: keyObject,
      purpose: keyUtilType, // airwallex - openai - polymarket
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return { isOk: res.ok };
};

export const lendmyKey = async (
  keyval: string,
  targetemail: string,
  timevalidFor: string,
  keyUtilType: string,
  payAmount: string,
  payCurrency: string
): Promise<{ message: string; data: string }> => {
  const URL = BASEURL + ENDPOINTS.sharekey;
  let accessToken: string | null = localStorage.getItem("spheretoken");

  const keyObject = JSON.stringify({ value: keyval });

  let res: Response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      email: targetemail,
      key: keyObject,
      time: timevalidFor,
      purpose: keyUtilType,
      charge: payAmount,
      currency: payCurrency,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.json();
};

export const doKeyPayment = async (
  secretNonce: string
): Promise<{ status: number }> => {
  const URL = BASEURL + ENDPOINTS.keypayment;
  let accessToken: string | null = localStorage.getItem("spheretoken");

  let res: Response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      nonce: secretNonce,
    }),
  });

  return { status: res?.status };
};

export const UseAirWallexKey = async (
  id: string,
  nonce: string
): Promise<{ airWlx: airWlxbalType[]; isOk: boolean; status: number }> => {
  const URL = BASEURL + ENDPOINTS.usekey + `?id=${id}&nonce=${nonce}`;
  let accessToken: string | null = localStorage.getItem("spheretoken");

  let res: Response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();

  return { airWlx: data, isOk: res.ok, status: res.status };
};

export const UseOpenAiKey = async (
  id: string,
  nonce: string
): Promise<{
  response: string;
  accessToken: string;
  conversationId: string;
}> => {
  const URL = BASEURL + ENDPOINTS.usekey + `?id=${id}&nonce=${nonce}`;
  let accessToken: string | null = localStorage.getItem("spheretoken");

  let res: Response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({ nonce: nonce }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.json();
};
