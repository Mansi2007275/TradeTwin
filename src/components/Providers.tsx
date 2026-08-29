"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/config/wagmi";
import { WalletSessionProvider } from "@/context/WalletSessionContext";
import { AnalysisProvider } from "@/context/AnalysisContext";
import { SimulationProvider } from "@/context/SimulationContext";
import { ToastProvider } from "@/context/ToastContext";
import { RegistryProvider } from "@/context/RegistryContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <WalletSessionProvider>
          <ToastProvider>
            <RegistryProvider>
              <AnalysisProvider>
                <SimulationProvider>{children}</SimulationProvider>
              </AnalysisProvider>
            </RegistryProvider>
          </ToastProvider>
        </WalletSessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
