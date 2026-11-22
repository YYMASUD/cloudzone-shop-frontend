import { http, toQuery } from "./client";
import type {
  AddressCreateRequest,
  AddressResponse,
  AddressUpdateRequest,
  CouponResponse,
  NotificationResponse,
  PageResponse,
  ShippingMethodResponse,
  UnreadCountResponse,
} from "./types";

// ── addresses ────────────���───────────────────────────────────────────────────

export function listAddresses() {
  return http.get<AddressResponse[]>("/api/addresses");
}

export function createAddress(body: AddressCreateRequest) {
  return http.post<AddressResponse>("/api/addresses", body);
}

export function updateAddress(id: number, body: AddressUpdateRequest) {
  return http.patch<AddressResponse>(`/api/addresses/${id}`, body);
}

export function deleteAddress(id: number) {
  return http.delete<void>(`/api/addresses/${id}`);
}

export function setDefaultAddress(id: number) {
  return http.put<AddressResponse>(`/api/addresses/${id}/default`);
}

// ── shipping methods (public for checkout) ───────────────────────────────────

export function listShippingMethods() {
  return http.get<ShippingMethodResponse[]>("/api/shipping-methods");
}

// ── coupons ──────────────────────────────────────────────────────────────────

export function validateCoupon(code: string, subtotal?: number) {
  return http.get<CouponResponse>(
    `/api/coupons/${encodeURIComponent(code)}${toQuery({ subtotal })}`,
  );
}

// ── notifications ────────────────────────────────────────────────────────────

export function listNotifications(page = 0, size = 20) {
  return http.get<PageResponse<NotificationResponse>>(
    `/api/notifications${toQuery({ page, size })}`,
  );
}

export function getUnreadCount() {
  return http.get<UnreadCountResponse>("/api/notifications/unread-count");
}

export function markNotificationRead(id: number) {
  return http.patch<void>(`/api/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return http.patch<void>("/api/notifications/read-all");
}

// Re-export for feature modules.
export type { AddressResponse, ShippingMethodResponse, CouponResponse } from "./types";
