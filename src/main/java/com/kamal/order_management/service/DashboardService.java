package com.kamal.order_management.service;

import com.kamal.order_management.domain.CustomerOrder;
import com.kamal.order_management.domain.Role;
import com.kamal.order_management.dto.DashboardDtos.*;
import com.kamal.order_management.repository.OrderRepository;
import com.kamal.order_management.repository.ProductRepository;
import com.kamal.order_management.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final OrderRepository orders;
    private final UserRepository users;
    private final ProductRepository products;

    public DashboardService(OrderRepository orders, UserRepository users, ProductRepository products) {
        this.orders = orders;
        this.users = users;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public DashboardResponse build(int days) {
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        Map<LocalDate, BigDecimal> revenue = new TreeMap<>();
        Map<LocalDate, Long> count = new HashMap<>();
        for (int i = 0; i < days; i++) { revenue.put(start.plusDays(i), BigDecimal.ZERO); count.put(start.plusDays(i), 0L); }
        for (CustomerOrder o : orders.findPaidSince(start.atStartOfDay())) {
            LocalDate d = o.getCreatedAt().toLocalDate();
            revenue.merge(d, o.getTotal(), BigDecimal::add);
            count.merge(d, 1L, Long::sum);
        }
        List<DailyRevenue> daily = revenue.entrySet().stream()
                .map(e -> new DailyRevenue(e.getKey().toString(), e.getValue(), count.get(e.getKey()))).toList();

        List<StatusCount> byStatus = orders.countByStatus().stream()
                .map(r -> new StatusCount(r[0].toString(), ((Number) r[1]).longValue())).toList();

        List<TopProduct> top = orders.topProducts().stream().limit(5)
                .map(r -> new TopProduct((String) r[0], ((Number) r[1]).longValue(), (BigDecimal) r[2])).toList();

        long customers = users.countByRole(Role.CUSTOMER);
        return new DashboardResponse(orders.totalRevenue(), orders.count(), customers, products.count(),
                orders.totalDiscount(), orders.countWithCoupon(), daily, byStatus, top);
    }
}
