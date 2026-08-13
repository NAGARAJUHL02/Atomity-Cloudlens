/**
 * providers.tsx — Client-side context providers
 *
 * WHY QueryClient is created inside useState:
 * In React 18+ with streaming SSR (and React Server Components),
 * if you create QueryClient at module scope it would be shared
 * across all requests on the server, leaking data between users.
 * Creating it inside useState ensures each client gets its own
 * instance, and it survives re-renders without being recreated.
 *
 * This file is marked "use client" because QueryClientProvider
 * needs access to React context, which only works client-side
 * in the App Router.
 */

"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  /*
   * useState initialiser runs once — the QueryClient is created on
   * first render and reused for the lifetime of the app.
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /*
             * Avoid refetching when the browser tab regains focus
             * during development — it's distracting and wastes
             * API calls.
             */
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
