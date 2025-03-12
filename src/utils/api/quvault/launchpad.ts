import { QUVAULT_BASEURL, QUVAULT_ENDPOINTS } from "../config";

export type launchpadstore = {
  store_id: string;
  store_name: string;
  merchant_email: string;
  id: string;
  symbol: string;
  logo_url: string;
  blockchain: number;
  price: number;
  total_supply: number;
  presale_percentage: number;
  liquidity_percentage: number;
  merchant_percentage: number;
  margin_percentage: number;
  offered_at: string;
  apy: number;
  unlocking_condition: number;
  reversal_condition: number;
  token_address: string | null;
  contract_address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export const getLaunchPadStores = async (): Promise<{
  data: launchpadstore[];
}> => {
  let URL = QUVAULT_BASEURL + QUVAULT_ENDPOINTS.launchpad;
  let quvaultToken = localStorage.getItem("quvaulttoken");

  const res = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${quvaultToken}`,
    },
  });

  return res.json();
};

export const launchPadStoreSubscribe = async (
  storeId: string,
  subscribeAmount: number
): Promise<{ status: number }> => {
  let URL = QUVAULT_BASEURL + QUVAULT_ENDPOINTS.launchpadsubscribe + storeId;
  let quvaultToken = localStorage.getItem("quvaulttoken");

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${quvaultToken}`,
    },
    body: JSON.stringify({ amount: subscribeAmount }),
  });

  return { status: res.status };
};
