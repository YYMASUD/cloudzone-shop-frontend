"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";

/** Wishlist: list + add/remove mutations, all disabled when anonymous. */
export function useWishlist() {
  const status = useSessionStore((s) => s.status);
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => shopApi.listWishlist(),
    enabled: status === "authenticated",
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => shopApi.addWishlistItem({ productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (wishlistItemId: number) => shopApi.removeWishlistItem(wishlistItemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}
