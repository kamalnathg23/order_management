package com.kamal.order_management.dto;

import java.math.BigDecimal;
import java.util.List;

public final class DashboardDtos {
    private DashboardDtos() {}

    public record DailyRevenue(String date, BigDecimal revenue, long orders) {}
    public record StatusCount(String status, long count) {}
    public record TopProduct(String name, long quantity, BigDecimal revenue) {}

    public record DashboardResponse(BigDecimal totalRevenue, long totalOrders, long totalCustomers,
                                    long totalProducts, BigDecimal totalDiscount, long couponOrders,
                                    List<DailyRevenue> revenueByDay, List<StatusCount> ordersByStatus,
                                    List<TopProduct> topProducts) {}
}
