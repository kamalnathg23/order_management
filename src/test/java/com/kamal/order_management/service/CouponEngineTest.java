package com.kamal.order_management.service;

import static org.junit.jupiter.api.Assertions.*;

import com.kamal.order_management.domain.Coupon;
import com.kamal.order_management.domain.DiscountType;
import com.kamal.order_management.exception.InvalidCouponException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class CouponEngineTest {

    private final LocalDateTime now = LocalDateTime.of(2026, 1, 15, 12, 0);

    private Coupon coupon(DiscountType type, String value) {
        Coupon c = new Coupon();
        c.setCode("TEST");
        c.setType(type);
        c.setValue(new BigDecimal(value));
        return c;
    }

    @Test
    void percentageDiscount() {
        assertEquals(new BigDecimal("100.00"),
                CouponEngine.calculateDiscount(coupon(DiscountType.PERCENTAGE, "10"), new BigDecimal("1000"), now));
    }

    @Test
    void percentageIsCappedByMaxDiscount() {
        Coupon c = coupon(DiscountType.PERCENTAGE, "50");
        c.setMaxDiscount(new BigDecimal("200"));
        assertEquals(new BigDecimal("200.00"), CouponEngine.calculateDiscount(c, new BigDecimal("1000"), now));
    }

    @Test
    void fixedDiscountNeverExceedsSubtotal() {
        assertEquals(new BigDecimal("300.00"),
                CouponEngine.calculateDiscount(coupon(DiscountType.FIXED, "500"), new BigDecimal("300"), now));
    }

    @Test
    void rejectsBelowMinimumOrder() {
        Coupon c = coupon(DiscountType.FIXED, "100");
        c.setMinOrderAmount(new BigDecimal("1000"));
        assertThrows(InvalidCouponException.class, () -> CouponEngine.calculateDiscount(c, new BigDecimal("999"), now));
    }

    @Test
    void rejectsExpiredInactiveAndExhausted() {
        Coupon expired = coupon(DiscountType.FIXED, "10");
        expired.setValidTo(now.minusDays(1));
        assertThrows(InvalidCouponException.class, () -> CouponEngine.calculateDiscount(expired, BigDecimal.TEN, now));

        Coupon inactive = coupon(DiscountType.FIXED, "10");
        inactive.setActive(false);
        assertThrows(InvalidCouponException.class, () -> CouponEngine.calculateDiscount(inactive, BigDecimal.TEN, now));

        Coupon used = coupon(DiscountType.FIXED, "10");
        used.setUsageLimit(1);
        used.setUsedCount(1);
        assertThrows(InvalidCouponException.class, () -> CouponEngine.calculateDiscount(used, BigDecimal.TEN, now));
    }
}
