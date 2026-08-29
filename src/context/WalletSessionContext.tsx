"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useDisconnect } from "wagmi";
import { resetWalletOnPageLoad } from "@/lib/wallet/session";

interface WalletSessionContextValue {
  /** False until disconnect + session clear has run on this page load. */
  sessionReady: boolean;
}

const WalletSessionContext = createContext<WalletSessionContextValue>({
  sessionReady: false,
});

if (typeof window !== "undefined") {
  resetWalletOnPageLoad();
}

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const { disconnect } = useDisconnect();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const runReset = () => {
      resetWalletOnPageLoad();
      disconnect();
    };

    runReset();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        runReset();
        if (!cancelled) setSessionReady(false);
        window.setTimeout(() => {
          if (!cancelled) setSessionReady(true);
        }, 0);
      }
    };

    window.addEventListener("pageshow", onPageShow);

    const readyTimer = window.setTimeout(() => {
      if (!cancelled) setSessionReady(true);
    }, 0);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      window.clearTimeout(readyTimer);
    };
  }, [disconnect]);

  return (
    <WalletSessionContext.Provider value={{ sessionReady }}>
      {children}
    </WalletSessionContext.Provider>
  );
}

export function useWalletSession() {
  return useContext(WalletSessionContext);
}
