package com.kamal.order_management.web;

import com.kamal.order_management.dto.DashboardDtos.DashboardResponse;
import com.kamal.order_management.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    private final DashboardService service;

    public AdminDashboardController(DashboardService service) { this.service = service; }

    @GetMapping
    public DashboardResponse get(@RequestParam(defaultValue = "30") int days) {
        return service.build(Math.max(1, Math.min(days, 365)));
    }
}
