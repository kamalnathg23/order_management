package com.kamal.order_management.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor
public class Coupon {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private long version;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType type;

    /** Percentage (0-100) for PERCENTAGE, currency amount for FIXED. */
    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    @Column(precision = 12, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /** Cap for percentage coupons; null = no cap. */
    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    private LocalDateTime validFrom;
    private LocalDateTime validTo;

    /** null = unlimited. */
    private Integer usageLimit;

    private int usedCount = 0;

    private boolean active = true;
}
