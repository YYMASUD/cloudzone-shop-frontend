"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import type { AddCartItemRequest, UpdateCartItemRequest } from "@/lib/api/types";

const CART_KEY = ["cart"] as const;

/** The signed-in shopper's cart. Disabled when anonymous (cart is server-side per user). */
export function useCart() {
  const status = useSessionStore((s) => s.status);
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => shopApi.getCart(),
    enabled: status === "authenticated",
    staleTime: 10_000,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddCartItemRequest) => shopApi.addCartItem(body),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateCartItemRequest }) =>
      shopApi.updateCartItem(id, body),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shopApi.removeCartItem(id),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}
