"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import type { ProductListParams, ReviewCreateRequest, ReviewUpdateRequest } from "@/lib/api/types";

export const catalogKeys = {
  products: (params: ProductListParams) => ["catalog", "products", params] as const,
  product: (slug: string) => ["catalog", "product", slug] as const,
  variants: (slug: string) => ["catalog", "variants", slug] as const,
  categories: ["catalog", "categories"] as const,
  brands: ["catalog", "brands"] as const,
  reviews: (productId: number, page: number) => ["catalog", "reviews", productId, page] as const,
};

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.listProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => catalogApi.getProduct(slug),
    enabled: Boolean(slug),
  });
}

export function useProductVariants(slug: string) {
  return useQuery({
    queryKey: catalogKeys.variants(slug),
    queryFn: () => catalogApi.listProductVariants(slug),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: () => catalogApi.listCategories(),
    staleTime: 5 * 60_000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands,
    queryFn: () => catalogApi.listBrands(),
    staleTime: 5 * 60_000,
  });
}

export function useProductReviews(productId: number, page = 0) {
  return useQuery({
    queryKey: catalogKeys.reviews(productId, page),
    queryFn: () => catalogApi.listProductReviews(productId, page),
    enabled: Boolean(productId),
  });
}

export function useCreateReview(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewCreateRequest) => catalogApi.createProductReview(productId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog", "reviews", productId] }),
  });
}

export function useUpdateReview(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReviewUpdateRequest }) =>
      catalogApi.updateReview(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog", "reviews", productId] }),
  });
}

export function useDeleteReview(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog", "reviews", productId] }),
  });
}
