package com.kamal.order_management.security;

/** Principal stored in the SecurityContext after JWT validation. */
public record AuthUser(Long id, String email, String role) {}
