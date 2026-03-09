/**
 * Track tokens in transit after a cross-chain convert.
 * Stored in localStorage with a TTL so the home page can show
 * an "in transit" banner instead of a confusing lower balance.
 */

const STORAGE_KEY = "rift_in_transit";
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface InTransitEntry {
  id: string;
  amount: string;
  token: string;
  fromChain: string;
  toChain: string;
  txHash: string | null;
  createdAt: number;
}

function readEntries(): InTransitEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: InTransitEntry[] = JSON.parse(raw);
    // Filter expired
    const now = Date.now();
    return entries.filter((e) => now - e.createdAt < TTL_MS);
  } catch {
    return [];
  }
}

function writeEntries(entries: InTransitEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addInTransit(entry: Omit<InTransitEntry, "id" | "createdAt">) {
  const entries = readEntries();
  entries.push({
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  });
  writeEntries(entries);
}

export function getInTransit(): InTransitEntry[] {
  const entries = readEntries();
  // Clean up expired on read
  writeEntries(entries);
  return entries;
}

export function clearInTransit(id: string) {
  const entries = readEntries().filter((e) => e.id !== id);
  writeEntries(entries);
}

export function clearAllInTransit() {
  localStorage.removeItem(STORAGE_KEY);
}
