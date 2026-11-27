package com.kamal.order_management.exception;

public class OrderManagementException extends RuntimeException {

    public OrderManagementException(String message) {
        super(message);
    }

    public OrderManagementException(String message, Throwable cause) {
        super(message, cause);
    }
}