package com.kamal.order_management.service;

import com.kamal.order_management.domain.Role;
import com.kamal.order_management.domain.User;
import com.kamal.order_management.dto.AuthDtos.*;
import com.kamal.order_management.exception.BadRequestException;
import com.kamal.order_management.repository.UserRepository;
import com.kamal.order_management.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new BadRequestException("Email already registered");
        User u = users.save(new User(r.name().trim(), email, encoder.encode(r.password()), Role.CUSTOMER));
        return toResponse(u);
    }

    public AuthResponse login(LoginRequest r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .filter(x -> encoder.matches(r.password(), x.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return toResponse(u);
    }

    private AuthResponse toResponse(User u) {
        return new AuthResponse(jwt.generate(u), jwt.getExpirationMs(), u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
}
