/** Registered MetaMask wallet for this TradeTwin deployment. */
export const EXPECTED_WALLET =
  "0x9c7EC5B79c27Be88ABB98815246A48E125c6675c" as const;

/** @deprecated Use EXPECTED_WALLET */
export const DEMO_WALLET = EXPECTED_WALLET;

export const MONAD_CHAIN_ID = 10143;
export const MONAD_CHAIN_ID_HEX = "0x279f";

export function isExpectedWallet(address: string | undefined): boolean {
  if (!address) return false;
  return address.toLowerCase() === EXPECTED_WALLET.toLowerCase();
}
