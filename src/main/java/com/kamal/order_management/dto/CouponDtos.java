package com.kamal.order_management.dto;

import com.kamal.order_management.domain.Coupon;
import com.kamal.order_management.domain.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class CouponDtos {
    private CouponDtos() {}

    public record CouponRequest(@NotBlank String code, @NotNull DiscountType type,
                                @NotNull @DecimalMin("0.01") BigDecimal value,
                                BigDecimal minOrderAmount, BigDecimal maxDiscount,
                                LocalDateTime validFrom, LocalDateTime validTo,
                                Integer usageLimit, Boolean active) {}

    public record CouponResponse(Long id, String code, DiscountType type, BigDecimal value,
                                 BigDecimal minOrderAmount, BigDecimal maxDiscount,
                                 LocalDateTime validFrom, LocalDateTime validTo,
                                 Integer usageLimit, int usedCount, boolean active) {
        public static CouponResponse of(Coupon c) {
            return new CouponResponse(c.getId(), c.getCode(), c.getType(), c.getValue(), c.getMinOrderAmount(),
                    c.getMaxDiscount(), c.getValidFrom(), c.getValidTo(), c.getUsageLimit(), c.getUsedCount(), c.isActive());
        }
    }

    public record ValidateCouponRequest(@NotBlank String code, @NotNull @DecimalMin("0.00") BigDecimal subtotal) {}

    public record ValidateCouponResponse(String code, BigDecimal subtotal, BigDecimal discount, BigDecimal total) {}
}
