const USER_CONNECTED_KEY = "tradetwin:user-connected";

const PERSISTENCE_PREFIXES = ["wagmi.", "wc@2", "@wagmi/"];

export function clearWalletPersistence(): void {
  if (typeof window === "undefined") return;

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (PERSISTENCE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key);
      }
    }
  }
}

/** Clears the in-tab session flag so reload always requires a fresh connect click. */
export function clearUserConnectedSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(USER_CONNECTED_KEY);
}

export function markUserConnectedSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(USER_CONNECTED_KEY, "1");
}

export function hasUserConnectedSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(USER_CONNECTED_KEY) === "1";
}

/** Run synchronously on every full page load before React hydrates wallet state. */
export function resetWalletOnPageLoad(): void {
  clearWalletPersistence();
  clearUserConnectedSession();
}
