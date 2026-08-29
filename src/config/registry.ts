const REGISTRY_STORAGE_KEY = "tradetwin:registry-address";

import deployed from "./deployed-registry.json";

export function resolveRegistryAddress(): `0x${string}` | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (stored?.startsWith("0x") && stored.length === 42) {
      return stored as `0x${string}`;
    }
  }

  const envAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  if (envAddress?.startsWith("0x") && envAddress.length === 42) {
    return envAddress as `0x${string}`;
  }

  if (
    deployed.address &&
    deployed.address !== "0x0000000000000000000000000000000000000000"
  ) {
    return deployed.address as `0x${string}`;
  }

  return null;
}

export function saveRegistryAddress(address: `0x${string}`) {
  if (typeof window !== "undefined") {
    localStorage.setItem(REGISTRY_STORAGE_KEY, address);
  }
}
