"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes - data is considered fresh for 2 min
            gcTime: 30 * 60 * 1000, // 30 minutes - keep cached data for 30 min
            refetchOnWindowFocus: true, // Refetch when user returns to the tab
            refetchOnReconnect: true, // Refetch when network reconnects
            refetchOnMount: true, // Refetch stale data on mount
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
