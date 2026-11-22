"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import type { CheckoutRequest } from "@/lib/api/types";

export function useMyOrders(page = 0, size = 10) {
  const status = useSessionStore((s) => s.status);
  return useQuery({
    queryKey: ["orders", page, size],
    queryFn: () => shopApi.listMyOrders(page, size),
    enabled: status === "authenticated",
  });
}

export function useOrder(orderNumber: string) {
  const status = useSessionStore((s) => s.status);
  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => shopApi.getMyOrder(orderNumber),
    enabled: status === "authenticated" && Boolean(orderNumber),
  });
}

/** Checkout clears the cart cache and seeds the new order. */
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckoutRequest) => shopApi.checkout(body),
    onSuccess: (order) => {
      qc.setQueryData(["order", order.orderNumber], order);
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePayOrder(orderNumber: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shopApi.payOrder(orderNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orderNumber] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder(orderNumber: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shopApi.cancelMyOrder(orderNumber),
    onSuccess: (order) => {
      qc.setQueryData(["order", orderNumber], order);
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
