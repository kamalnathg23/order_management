package com.kamal.order_management.model;
import java.math.BigDecimal;

public class OrderItem {
    private final Product product;
    private final int quantity;
    private final BigDecimal unitPrice;   // price at the time of ordering

    public OrderItem(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = product.getPrice();
    }

     public Product getProduct() { return product; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }


    public BigDecimal getSubtotal() {           //add to cart and total
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

}