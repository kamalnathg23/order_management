import CouponManager from "@/components/CouponManager";
import { apiGet } from "@/lib/server";
import type { Coupon } from "@/lib/types";

export default async function AdminCoupons() {
  const coupons = await apiGet<Coupon[]>("/api/admin/coupons");
  return (<><h1>Coupons</h1><CouponManager coupons={coupons} /></>);
}
