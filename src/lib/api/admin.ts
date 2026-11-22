import { http, toQuery } from "./client";
import type {
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
  DashboardStatsResponse,
  LowStockAlertResponse,
  MediaAssetResponse,
  NotificationSendRequest,
  NotificationResponse,
  OrderResponse,
  OrderStatusUpdateRequest,
  PageResponse,
  RefundRequest,
  ReviewResponse,
  ShippingMethodCreateRequest,
  ShippingMethodResponse,
  ShippingMethodUpdateRequest,
} from "./types";

/**
 * Role-gated admin surface (/api/admin/** requires the ADMIN role on the JWT;
 * the backend enforces this — the frontend only hides or shows UI).
 */

// ── dashboard ────────────────────────────────────────────────────────────────

export function getDashboardStats() {
  return http.get<DashboardStatsResponse>("/api/admin/dashboard");
}

// ── orders ───────────────────────────────────────────────────────────────────

export function adminListOrders(page = 0, size = 20) {
  return http.get<PageResponse<OrderResponse>>(`/api/admin/orders${toQuery({ page, size })}`);
}

export function adminGetOrder(id: number) {
  return http.get<OrderResponse>(`/api/admin/orders/${id}`);
}

export function adminUpdateOrderStatus(id: number, body: OrderStatusUpdateRequest) {
  return http.patch<OrderResponse>(`/api/admin/orders/${id}/status`, body);
}

export function adminRefundOrder(id: number, body: RefundRequest = {}) {
  return http.post<OrderResponse>(`/api/admin/orders/${id}/refund`, body);
}

/** Marks a COD order as cash-collected. */
export function adminCollectCash(id: number) {
  return http.post<OrderResponse>(`/api/admin/orders/${id}/collect`);
}

// ── coupons ──────────────────────────────────────────────────────────────────

export function adminListCoupons(page = 0, size = 20) {
  return http.get<PageResponse<CouponResponse>>(`/api/admin/coupons${toQuery({ page, size })}`);
}

export function adminGetCoupon(id: number) {
  return http.get<CouponResponse>(`/api/admin/coupons/${id}`);
}

export function adminCreateCoupon(body: CouponCreateRequest) {
  return http.post<CouponResponse>("/api/admin/coupons", body);
}

export function adminUpdateCoupon(id: number, body: CouponUpdateRequest) {
  return http.patch<CouponResponse>(`/api/admin/coupons/${id}`, body);
}

// ── inventory ────────────────────────────────────────────────────────────────

export function adminListLowStockAlerts(page = 0, size = 20) {
  return http.get<PageResponse<LowStockAlertResponse>>(
    `/api/admin/inventory/low-stock-alerts${toQuery({ page, size })}`,
  );
}

export function adminAcknowledgeLowStockAlert(id: number) {
  return http.post<void>(`/api/admin/inventory/low-stock-alerts/${id}/acknowledge`);
}

export function adminExpireReservationsSweep() {
  return http.post<unknown>("/api/admin/inventory/reservations/expire-sweep");
}

// ── reviews moderation ───────────────────────────────────────────────────────

export function adminListReviews(page = 0, size = 20) {
  return http.get<PageResponse<ReviewResponse>>(`/api/admin/reviews${toQuery({ page, size })}`);
}

export function adminDeleteReview(reviewId: number) {
  return http.delete<void>(`/api/admin/reviews/${reviewId}`);
}

// ── shipping methods ─────────────────────────────────────────────────────────

export function adminListShippingMethods() {
  return http.get<ShippingMethodResponse[]>("/api/admin/shipping-methods");
}

export function adminCreateShippingMethod(body: ShippingMethodCreateRequest) {
  return http.post<ShippingMethodResponse>("/api/admin/shipping-methods", body);
}

export function adminUpdateShippingMethod(id: number, body: ShippingMethodUpdateRequest) {
  return http.patch<ShippingMethodResponse>(`/api/admin/shipping-methods/${id}`, body);
}

// ── notifications ────────────────────────────────────────────────────────────

export function adminSendNotification(body: NotificationSendRequest) {
  return http.post<NotificationResponse>("/api/admin/notifications/send", body);
}

export function adminListUserNotifications(userId: number, page = 0, size = 20) {
  return http.get<PageResponse<NotificationResponse>>(
    `/api/admin/notifications${toQuery({ userId, page, size })}`,
  );
}

// ── media (MinIO) ────────────────────────────────────────────────────────────

export function adminListMedia(page = 0, size = 20) {
  return http.get<PageResponse<MediaAssetResponse>>(`/api/admin/media${toQuery({ page, size })}`);
}

export function adminGetMedia(id: number) {
  return http.get<MediaAssetResponse>(`/api/admin/media/${id}`);
}

export function adminUploadMedia(file: File, altText?: string) {
  const form = new FormData();
  form.append("file", file);
  if (altText) form.append("altText", altText);
  return http.post<MediaAssetResponse>("/api/admin/media", form);
}

export function adminDeleteMedia(id: number) {
  return http.delete<void>(`/api/admin/media/${id}`);
}
