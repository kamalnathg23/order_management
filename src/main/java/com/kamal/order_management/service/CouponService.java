package com.kamal.order_management.service;

import com.kamal.order_management.domain.Coupon;
import com.kamal.order_management.domain.DiscountType;
import com.kamal.order_management.dto.CouponDtos.*;
import com.kamal.order_management.exception.BadRequestException;
import com.kamal.order_management.exception.InvalidCouponException;
import com.kamal.order_management.exception.ResourceNotFoundException;
import com.kamal.order_management.repository.CouponRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CouponService {

    private final CouponRepository repo;

    public CouponService(CouponRepository repo) { this.repo = repo; }

    public List<CouponResponse> findAll() {
        return repo.findAll().stream().map(CouponResponse::of).toList();
    }

    @Transactional
    public CouponResponse create(CouponRequest r) {
        if (repo.existsByCodeIgnoreCase(r.code().trim())) throw new BadRequestException("Coupon code already exists");
        Coupon c = new Coupon();
        apply(c, r);
        return CouponResponse.of(repo.save(c));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest r) {
        Coupon c = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
        apply(c, r);
        return CouponResponse.of(c);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Coupon", id);
        repo.deleteById(id);
    }

    public ValidateCouponResponse validate(ValidateCouponRequest r) {
        Coupon c = findByCode(r.code());
        BigDecimal discount = CouponEngine.calculateDiscount(c, r.subtotal(), LocalDateTime.now());
        return new ValidateCouponResponse(c.getCode(), r.subtotal(), discount, r.subtotal().subtract(discount));
    }

    public Coupon findByCode(String code) {
        return repo.findByCodeIgnoreCase(code.trim()).orElseThrow(() -> new InvalidCouponException("Invalid coupon code"));
    }

    private void apply(Coupon c, CouponRequest r) {
        if (r.type() == DiscountType.PERCENTAGE && r.value().compareTo(BigDecimal.valueOf(100)) > 0)
            throw new BadRequestException("Percentage cannot exceed 100");
        if (r.validFrom() != null && r.validTo() != null && r.validTo().isBefore(r.validFrom()))
            throw new BadRequestException("validTo must be after validFrom");
        c.setCode(r.code().trim().toUpperCase());
        c.setType(r.type());
        c.setValue(r.value());
        c.setMinOrderAmount(r.minOrderAmount() == null ? BigDecimal.ZERO : r.minOrderAmount());
        c.setMaxDiscount(r.maxDiscount());
        c.setValidFrom(r.validFrom());
        c.setValidTo(r.validTo());
        c.setUsageLimit(r.usageLimit());
        c.setActive(r.active() == null || r.active());
    }
}
