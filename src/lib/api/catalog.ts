import { http, query, toQuery } from "./client";
import type {
  CategoryResponse,
  ProductListParams,
  ProductResponse,
  ProductVariantResponse,
  PageResponse,
  BrandResponse,
  ReviewCreateRequest,
  ReviewResponse,
  ReviewUpdateRequest,
} from "./types";

// ── catalog (public browsing; the backend currently requires a bearer token) ──

export function listProducts(params: ProductListParams = {}) {
  return http.get<PageResponse<ProductResponse>>(
    `/api/products${toQuery(query(params))}`,
    { anonymous: true },
  );
}

export function getProduct(slug: string) {
  return http.get<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`, {
    anonymous: true,
  });
}

export function listProductVariants(slug: string) {
  return http.get<ProductVariantResponse[]>(
    `/api/products/${encodeURIComponent(slug)}/variants`,
    { anonymous: true },
  );
}

export function listCategories() {
  return http.get<CategoryResponse[]>("/api/categories", { anonymous: true });
}

export function listChildCategories(slug: string) {
  return http.get<CategoryResponse[]>(
    `/api/categories/${encodeURIComponent(slug)}/children`,
    { anonymous: true },
  );
}

export function listBrands() {
  return http.get<BrandResponse[]>("/api/brands", { anonymous: true });
}

// ── reviews (nested under /api/products) ─────────────────────────────────────

export function listProductReviews(productId: number, page = 0, size = 10) {
  return http.get<PageResponse<ReviewResponse>>(
    `/api/products/${productId}/reviews${toQuery({ page, size })}`,
    { anonymous: true },
  );
}

export function createProductReview(productId: number, body: ReviewCreateRequest) {
  return http.post<ReviewResponse>(`/api/products/${productId}/reviews`, body);
}

export function updateReview(reviewId: number, body: ReviewUpdateRequest) {
  return http.patch<ReviewResponse>(`/api/products/reviews/${reviewId}`, body);
}

export function deleteReview(reviewId: number) {
  return http.delete<void>(`/api/products/reviews/${reviewId}`);
}

// Re-exported for convenience of feature modules.
export type { ReviewResponse, ReviewCreateRequest, ReviewUpdateRequest } from "./types";
