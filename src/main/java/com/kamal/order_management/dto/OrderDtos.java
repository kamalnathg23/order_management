package com.kamal.order_management.dto;

import com.kamal.order_management.domain.CustomerOrder;
import com.kamal.order_management.domain.OrderLine;
import com.kamal.order_management.model.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class OrderDtos {
    private OrderDtos() {}

    public record OrderItemRequest(@NotNull Long productId, @Min(1) int quantity) {}

    public record CreateOrderRequest(@NotEmpty List<@Valid OrderItemRequest> items, String couponCode) {}

    public record UpdateStatusRequest(@NotNull OrderStatus status) {}

    public record OrderItemResponse(Long productId, String productName, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        static OrderItemResponse of(OrderLine l) {
            return new OrderItemResponse(l.getProduct().getId(), l.getProductName(), l.getQuantity(), l.getUnitPrice(), l.getSubtotal());
        }
    }

    public record OrderResponse(Long id, String customerEmail, OrderStatus status, BigDecimal subtotal,
                                BigDecimal discount, BigDecimal total, String couponCode,
                                LocalDateTime createdAt, List<OrderItemResponse> items) {
        public static OrderResponse of(CustomerOrder o) {
            return new OrderResponse(o.getId(), o.getUser().getEmail(), o.getStatus(), o.getSubtotal(), o.getDiscount(),
                    o.getTotal(), o.getCouponCode(), o.getCreatedAt(),
                    o.getItems().stream().map(OrderItemResponse::of).toList());
        }
    }
}
