package com.kamal.order_management.web;

import com.kamal.order_management.dto.OrderDtos.*;
import com.kamal.order_management.security.AuthUser;
import com.kamal.order_management.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody CreateOrderRequest r) {
        return service.create(user.id(), r);
    }

    @GetMapping("/api/orders/me")
    public List<OrderResponse> mine(@AuthenticationPrincipal AuthUser user) { return service.forUser(user.id()); }

    @PostMapping("/api/orders/{id}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.cancelOwn(user.id(), id);
    }

    @GetMapping("/api/admin/orders")
    public List<OrderResponse> all() { return service.all(); }

    @PatchMapping("/api/admin/orders/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest r) {
        return service.updateStatus(id, r.status());
    }
}
