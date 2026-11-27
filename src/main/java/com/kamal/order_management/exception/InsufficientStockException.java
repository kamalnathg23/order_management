package com.kamal.order_management.exception;

public class InsufficientStockException extends OrderManagementException {

    private final String productName;
    private final int requested;
    private final int available;

    public InsufficientStockException(String productName, int requested, int available) {
        super("Insufficient stock for " + productName
                + ": requested " + requested + ", available " + available);
        this.productName = productName;
        this.requested = requested;
        this.available = available;
    }

    public String getProductName() { return productName; }
    public int getRequested() { return requested; }
    public int getAvailable() { return available; }
}