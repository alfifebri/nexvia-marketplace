"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuthStore } from "@/stores/auth-store";

function SessionWatcher() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const mode = useAuthStore((state) => state.mode);

  useEffect(() => {
    const handler = () => {
      if (mode === "live") clearSession();
    };
    window.addEventListener("nexvia:session-expired", handler);
    return () => window.removeEventListener("nexvia:session-expired", handler);
  }, [clearSession, mode]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SessionWatcher />
        {children}
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{
            className:
              "!rounded-2xl !border-border !bg-card !text-card-foreground !shadow-float !font-sans",
            descriptionClassName: "!text-muted-foreground",
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
