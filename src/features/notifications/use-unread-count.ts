"use client";

import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";

/**
 * Unread notification count for the signed-in user. Disabled (and null) when
 * anonymous so callers can hide the badge.
 */
export function useUnreadCount() {
  const status = useSessionStore((s) => s.status);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => accountApi.getUnreadCount(),
    enabled: status === "authenticated",
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    unread: status === "authenticated" ? (data?.unread ?? 0) : 0,
    isLoading,
  };
}
