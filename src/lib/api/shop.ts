import { http, toQuery } from "./client";
import type {
  AddCartItemRequest,
  CartResponse,
  CheckoutRequest,
  OrderResponse,
  PageResponse,
  PaymentResponse,
  UpdateCartItemRequest,
  WishlistAddRequest,
  WishlistItemResponse,
} from "./types";

// ── cart ─────────────────────────────────────────────────────────────────────

export function getCart() {
  return http.get<CartResponse>("/api/cart");
}

export function addCartItem(body: AddCartItemRequest) {
  return http.post<CartResponse>("/api/cart/items", body);
}

export function updateCartItem(cartItemId: number, body: UpdateCartItemRequest) {
  return http.patch<CartResponse>(`/api/cart/items/${cartItemId}`, body);
}

export function removeCartItem(cartItemId: number) {
  return http.delete<CartResponse>(`/api/cart/items/${cartItemId}`);
}

// ── wishlist ─────────────────────────────────────────────────────────────────

export function listWishlist(page = 0, size = 20) {
  return http.get<PageResponse<WishlistItemResponse>>(`/api/wishlist/items${toQuery({ page, size })}`);
}

export function addWishlistItem(body: WishlistAddRequest) {
  return http.post<void>("/api/wishlist/items", body);
}

export function removeWishlistItem(wishlistItemId: number) {
  return http.delete<void>(`/api/wishlist/items/${wishlistItemId}`);
}

// ── orders & payments ────────────────────────────────────────────────────────

export function checkout(body: CheckoutRequest) {
  return http.post<OrderResponse>("/api/orders/checkout", body);
}

export function listMyOrders(page = 0, size = 10) {
  return http.get<PageResponse<OrderResponse>>(`/api/orders${toQuery({ page, size })}`);
}

export function getMyOrder(orderNumber: string) {
  return http.get<OrderResponse>(`/api/orders/${encodeURIComponent(orderNumber)}`);
}

export function payOrder(orderNumber: string) {
  return http.post<PaymentResponse>(`/api/orders/${encodeURIComponent(orderNumber)}/pay`);
}

export function cancelMyOrder(orderNumber: string) {
  return http.post<OrderResponse>(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`);
}

// Re-export for convenience.
export type { OrderResponse, PaymentResponse } from "./types";
