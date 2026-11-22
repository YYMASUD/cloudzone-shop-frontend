/**
 * TypeScript mirrors of the backend DTOs (com.cloudzone.shopbackend.*).
 * Kept hand-rolled (not generated) so field names stay greppable; shapes follow
 * the backend records exactly. Enums mirror the Java enums.
 */

// ── common ───────────────────────────────────────────────────────────────────

/** Backend pagination envelope (common.web.PageResponse). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Backend error body (common.error.ApiError). */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  path: string;
  timestamp: string;
}

// ── enums (common.enums, notification, coupon, inventory) ────────────────────

export type Role = "CUSTOMER" | "ADMIN";

export type AuthProvider = "LOCAL" | "GOOGLE" | "APPLE";

export type PaymentMethod = "STRIPE" | "RAZORPAY" | "PAYPAL" | "SSLCOMMERZ" | "COD";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type CouponDiscountType = "PERCENT" | "FIXED";

export type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_PAID"
  | "ORDER_SHIPPED"
  | "ORDER_CANCELLED"
  | "PROMOTION"
  | "SYSTEM";

export type StockReservationStatus = "ACTIVE" | "COMMITTED" | "RELEASED";

/** Catalog sort tokens allowed by the backend (catalog.ProductSort). */
export type ProductSort = "newest" | "name" | "price_asc" | "price_desc";

// ── auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  emailVerified: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SocialLoginRequest {
  provider: Exclude<AuthProvider, "LOCAL">;
  idToken: string;
}

export interface ConfirmEmailRequest {
  code: string;
}

// ── catalog ──────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentSlug: string | null;
}

export interface BrandResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  /** Money amounts are major-unit decimals serialized as JSON numbers. */
  price: number;
  compareAtPrice: number | null;
  currency: string;
  stockQuantity: number;
  inStock: boolean;
  categorySlug: string | null;
  categoryName: string | null;
  brandSlug: string | null;
  brandName: string | null;
  imageKey: string | null;
}

export interface ProductVariantResponse {
  id: number;
  sku: string;
  name: string;
  options: string | null;
  price: number | null;
  effectivePrice: number;
  currency: string;
  stockQuantity: number;
  inStock: boolean;
}

export interface ProductListParams {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  size?: number;
}

// ── cart ─────────────────────────────────────────────────────────────────────

export interface CartItemResponse {
  id: number;
  productId: number;
  name: string;
  slug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartResponse {
  id: number;
  userId: number;
  currency: string;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ── wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItemResponse {
  id: number;
  productId: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  active: boolean;
  createdAt: string;
}

export interface WishlistAddRequest {
  productId: number;
}

// ── reviews ──────────────────────────────────────────────────────────────────

export interface ReviewResponse {
  id: number;
  productId: number;
  rating: number;
  title: string | null;
  body: string | null;
  authorName: string;
  createdAt: string;
}

export interface ReviewCreateRequest {
  rating: number;
  title?: string | null;
  body?: string | null;
}

export interface ReviewUpdateRequest {
  rating?: number;
  title?: string | null;
  body?: string | null;
}

// ── addresses / user ─────────────────────────────────────────────────────────

export interface AddressResponse {
  id: number;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressCreateRequest {
  label?: string | null;
  recipientName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault?: boolean;
}

export interface AddressUpdateRequest {
  label?: string | null;
  recipientName?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
}

export interface ProfileUpdateRequest {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

// ── shipping ─────────────────────────────────────────────────────────────────

export interface ShippingMethodResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  flatRate: number;
  estimatedDays: number | null;
}

export interface ShippingMethodCreateRequest {
  code: string;
  name: string;
  description?: string | null;
  flatRate: number;
  estimatedDays?: number | null;
  active?: boolean;
}

export interface ShippingMethodUpdateRequest {
  name?: string | null;
  description?: string | null;
  flatRate?: number;
  estimatedDays?: number | null;
  active?: boolean;
}

// ── coupons ──────────────────────────────────────────────────────────────────

export interface CouponResponse {
  id: number;
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderTotal: number | null;
  expiresAt: string | null;
}

export interface CouponCreateRequest {
  code: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderTotal?: number | null;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  active?: boolean;
}

export interface CouponUpdateRequest {
  description?: string | null;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minOrderTotal?: number | null;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  active?: boolean;
}

// ── orders ───────────────────────────────────────────────────────────────────

export interface CheckoutAddressRequest {
  recipientName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface CheckoutRequest {
  shippingAddressId?: number | null;
  shippingAddress?: CheckoutAddressRequest | null;
  billingAddressId?: number | null;
  billingAddress?: CheckoutAddressRequest | null;
  shippingMethodCode: string;
  couponCode?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddressResponse | null;
  billingAddress: OrderAddressResponse | null;
  notes: string | null;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface OrderAddressResponse {
  id: number;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

export interface RefundRequest {
  amount?: number | null;
  reason?: string | null;
}

// ── payments ─────────────────────────────────────────────────────────────────

export interface PaymentResponse {
  id: number;
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  receiptNumber: string | null;
  refundAmount: number | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

// ── notifications ────────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  unread: number;
}

export interface NotificationSendRequest {
  userId: number;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}

// ── inventory / stock reservations ───────────────────────────────────────────

export interface StockReservationResponse {
  id: number;
  productId: number;
  variantId: number | null;
  orderId: number | null;
  userId: number | null;
  quantity: number;
  status: StockReservationStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface HoldStockRequest {
  productId: number;
  variantId?: number | null;
  quantity: number;
  ttlMinutes?: number | null;
}

export interface CommitReservationRequest {
  orderId: number;
}

export interface LowStockAlertResponse {
  id: number;
  productId: number;
  variantId: number | null;
  threshold: number;
  currentStock: number;
  notifiedAt: string | null;
  acknowledgedAt: string | null;
}

// ── admin ────────────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  users: {
    total: number;
    enabled: number;
    customers: number;
    admins: number;
  };
  orders: Record<string, number>;
  revenue: number;
  revenueCurrency: string;
}

// ── media ────────────────────────────────────────────────────────────────────

export interface MediaAssetResponse {
  id: number;
  ownerUserId: number | null;
  fileName: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  altText: string | null;
  createdAt: string;
}
