"use client";

import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";

/** Active shipping methods, used at checkout to pick shipping + see the cost. */
export function useShippingMethods() {
  const status = useSessionStore((s) => s.status);
  return useQuery({
    queryKey: ["shipping-methods"],
    queryFn: () => accountApi.listShippingMethods(),
    enabled: status === "authenticated",
    staleTime: 5 * 60_000,
  });
}
