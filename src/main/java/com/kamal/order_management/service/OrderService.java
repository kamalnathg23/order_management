package com.kamal.order_management.service;

import com.kamal.order_management.domain.*;
import com.kamal.order_management.dto.OrderDtos.*;
import com.kamal.order_management.exception.BadRequestException;
import com.kamal.order_management.exception.InsufficientStockException;
import com.kamal.order_management.exception.ResourceNotFoundException;
import com.kamal.order_management.model.OrderStatus;
import com.kamal.order_management.repository.OrderRepository;
import com.kamal.order_management.repository.ProductRepository;
import com.kamal.order_management.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;
    private final CouponService coupons;

    public OrderService(OrderRepository orders, ProductRepository products, UserRepository users, CouponService coupons) {
        this.orders = orders;
        this.products = products;
        this.users = users;
        this.coupons = coupons;
    }

    @Transactional
    public OrderResponse create(Long userId, CreateOrderRequest req) {
        User user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
        CustomerOrder order = new CustomerOrder();
        order.setUser(user);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest i : req.items()) {
            ProductEntity p = products.findById(i.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", i.productId()));
            if (p.getStock() < i.quantity()) throw new InsufficientStockException(p.getName(), i.quantity(), p.getStock());
            p.setStock(p.getStock() - i.quantity());

            OrderLine line = new OrderLine();
            line.setProduct(p);
            line.setProductName(p.getName());
            line.setQuantity(i.quantity());
            line.setUnitPrice(p.getPrice());
            order.addLine(line);
            subtotal = subtotal.add(line.getSubtotal());
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (req.couponCode() != null && !req.couponCode().isBlank()) {
            Coupon c = coupons.findByCode(req.couponCode());
            discount = CouponEngine.calculateDiscount(c, subtotal, LocalDateTime.now());
            c.setUsedCount(c.getUsedCount() + 1);
            order.setCouponCode(c.getCode());
        }
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setTotal(subtotal.subtract(discount));
        return OrderResponse.of(orders.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> forUser(Long userId) {
        return orders.findByUserIdOrderByCreatedAtDesc(userId).stream().map(OrderResponse::of).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> all() {
        return orders.findAllByOrderByCreatedAtDesc().stream().map(OrderResponse::of).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        CustomerOrder o = orders.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (o.getStatus() == OrderStatus.CANCELLED) throw new BadRequestException("Cancelled orders cannot change status");
        if (status == OrderStatus.CANCELLED) restock(o);
        o.setStatus(status);
        return OrderResponse.of(o);
    }

    @Transactional
    public OrderResponse cancelOwn(Long userId, Long id) {
        CustomerOrder o = orders.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (!o.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Order", id);
        if (o.getStatus() != OrderStatus.PLACED) throw new BadRequestException("Only PLACED orders can be cancelled");
        restock(o);
        o.setStatus(OrderStatus.CANCELLED);
        return OrderResponse.of(o);
    }

    private void restock(CustomerOrder o) {
        o.getItems().forEach(l -> l.getProduct().setStock(l.getProduct().getStock() + l.getQuantity()));
    }
}
