package com.kamal.order_management.exception;

public class ResourceNotFoundException extends OrderManagementException {

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with id: " + id);
    }
}