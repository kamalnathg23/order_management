export type Role = "CUSTOMER" | "ADMIN";
export type OrderStatus = "PLACED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Product { id: number; name: string; description?: string; price: number; stock: number; imageUrl?: string; category?: string; mrp?: number }
export interface OrderItem { productId: number; productName: string; quantity: number; unitPrice: number; subtotal: number }
export interface Order {
  id: number; customerEmail: string; status: OrderStatus; subtotal: number; discount: number;
  total: number; couponCode?: string; createdAt: string; items: OrderItem[];
}
export interface Coupon {
  id: number; code: string; type: "PERCENTAGE" | "FIXED"; value: number; minOrderAmount?: number;
  maxDiscount?: number; validFrom?: string; validTo?: string; usageLimit?: number; usedCount: number; active: boolean;
}
export interface Dashboard {
  totalRevenue: number; totalOrders: number; totalCustomers: number; totalProducts: number;
  totalDiscount: number; couponOrders: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}
