package com.kamal.order_management.web;

import com.kamal.order_management.dto.CouponDtos.*;
import com.kamal.order_management.service.CouponService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class CouponController {
    private final CouponService service;

    public CouponController(CouponService service) { this.service = service; }

    /** Any authenticated user: preview a coupon against a cart subtotal. */
    @PostMapping("/api/coupons/validate")
    public ValidateCouponResponse validate(@Valid @RequestBody ValidateCouponRequest r) { return service.validate(r); }

    @GetMapping("/api/admin/coupons")
    public List<CouponResponse> list() { return service.findAll(); }

    @PostMapping("/api/admin/coupons")
    @ResponseStatus(HttpStatus.CREATED)
    public CouponResponse create(@Valid @RequestBody CouponRequest r) { return service.create(r); }

    @PutMapping("/api/admin/coupons/{id}")
    public CouponResponse update(@PathVariable Long id, @Valid @RequestBody CouponRequest r) { return service.update(id, r); }

    @DeleteMapping("/api/admin/coupons/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
