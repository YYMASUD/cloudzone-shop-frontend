"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import type { AddressCreateRequest, AddressUpdateRequest } from "@/lib/api/types";

const ADDRESSES_KEY = ["addresses"] as const;

export function useAddresses() {
  const status = useSessionStore((s) => s.status);
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => accountApi.listAddresses(),
    enabled: status === "authenticated",
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddressCreateRequest) => accountApi.createAddress(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AddressUpdateRequest }) =>
      accountApi.updateAddress(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountApi.deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountApi.setDefaultAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}
