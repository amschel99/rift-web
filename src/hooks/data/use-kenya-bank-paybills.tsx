import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_URL || "https://payment.riftfi.xyz";
const SDK_API_KEY = import.meta.env.VITE_SDK_API_KEY;

export interface KenyaBankPaybill {
  id: string;
  name: string;
  paybill: string;
  accountHint: string;
}

async function fetchKenyaBankPaybills(): Promise<KenyaBankPaybill[]> {
  const authToken = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/reference/kenya-bank-paybills`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SDK_API_KEY || "",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch bank paybills: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

export function useKenyaBankPaybills(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kenya-bank-paybills"],
    queryFn: fetchKenyaBankPaybills,
    enabled,
    // Reference data — cache aggressively.
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}
