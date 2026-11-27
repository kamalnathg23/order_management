package com.kamal.order_management.service;

import com.kamal.order_management.domain.Coupon;
import com.kamal.order_management.domain.DiscountType;
import com.kamal.order_management.exception.InvalidCouponException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Pure rule engine: validates a coupon against an order subtotal and computes the discount.
 * Rules: active, within validity window, usage limit not reached, min order amount met,
 * percentage capped by maxDiscount, discount never exceeds subtotal.
 */
public final class CouponEngine {

    private CouponEngine() {}

    public static BigDecimal calculateDiscount(Coupon c, BigDecimal subtotal, LocalDateTime now) {
        if (!c.isActive()) throw new InvalidCouponException("Coupon is inactive");
        if (c.getValidFrom() != null && now.isBefore(c.getValidFrom()))
            throw new InvalidCouponException("Coupon is not yet valid");
        if (c.getValidTo() != null && now.isAfter(c.getValidTo()))
            throw new InvalidCouponException("Coupon has expired");
        if (c.getUsageLimit() != null && c.getUsedCount() >= c.getUsageLimit())
            throw new InvalidCouponException("Coupon usage limit reached");
        BigDecimal min = c.getMinOrderAmount() == null ? BigDecimal.ZERO : c.getMinOrderAmount();
        if (subtotal.compareTo(min) < 0)
            throw new InvalidCouponException("Minimum order amount for this coupon is " + min);

        BigDecimal discount;
        if (c.getType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(c.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (c.getMaxDiscount() != null && discount.compareTo(c.getMaxDiscount()) > 0) discount = c.getMaxDiscount();
        } else {
            discount = c.getValue();
        }
        return discount.min(subtotal).setScale(2, RoundingMode.HALF_UP);
    }
}
