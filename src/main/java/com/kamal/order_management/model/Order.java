package com.kamal.order_management.model;

import com.kamal.order_management.model.OrderItem;
import com.kamal.order_management.model.Product;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Order {
    
    private final Long id;
    private final Customer customer;
    private final List<OrderItem> items = new ArrayList<>();
    private OrderStatus status = OrderStatus.PLACED;
    private final LocalDateTime createdAt = LocalDateTime.now();
    
    public Order(Long id, Customer customer) {
        this.id = id;
        this.customer = customer;
    }

    public void addItem(Product product, int quantity) {
        items.add(new OrderItem(product, quantity));
    }

     public BigDecimal getTotal() {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : items) {
            total = total.add(item.getSubtotal());
        }
        return total;
    }

     public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);   // protects internal list (encapsulation)
    }

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

}