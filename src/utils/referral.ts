/**
 * Generate a random 6-character alphanumeric referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get the full referral link for a given code
 */
export function getReferralLink(code: string): string {
  return `https://wallet.riftfi.xyz/auth?referrer=${code}`;
}

