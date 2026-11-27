package com.kamal.order_management.repository;

import com.kamal.order_management.domain.CustomerOrder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = {"items", "user"})
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"items", "user"})
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    @Query("select coalesce(sum(o.total), 0) from CustomerOrder o where o.status <> com.kamal.order_management.model.OrderStatus.CANCELLED")
    BigDecimal totalRevenue();

    @Query("select o.status, count(o) from CustomerOrder o group by o.status")
    List<Object[]> countByStatus();

    @Query("select o from CustomerOrder o where o.createdAt >= :from and o.status <> com.kamal.order_management.model.OrderStatus.CANCELLED")
    List<CustomerOrder> findPaidSince(LocalDateTime from);

    @Query("select l.productName, sum(l.quantity), sum(l.unitPrice * l.quantity) from OrderLine l "
         + "where l.order.status <> com.kamal.order_management.model.OrderStatus.CANCELLED "
         + "group by l.productName order by sum(l.quantity) desc")
    List<Object[]> topProducts();

    @Query("select count(o) from CustomerOrder o where o.couponCode is not null")
    long countWithCoupon();

    @Query("select coalesce(sum(o.discount), 0) from CustomerOrder o where o.status <> com.kamal.order_management.model.OrderStatus.CANCELLED")
    BigDecimal totalDiscount();
}
