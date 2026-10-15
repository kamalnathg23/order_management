package com.kamal.order_management.model;

import java.math.BigDecimal;
import java.util.Objects;

public class Product {
    private final Long id;
    private String name;
    private BigDecimal price;
    private int stock;

    public Product(Long id, String name, BigDecimal price, int stock) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product other)) return false;   // Java 17 pattern matching
        return Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Product{id=" + id + ", name=" + name + ", price=" + price + ", stock=" + stock + "}";
    }
}