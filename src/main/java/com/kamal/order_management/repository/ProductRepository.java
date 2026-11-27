package com.kamal.order_management.repository;

import com.kamal.order_management.domain.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    java.util.Optional<ProductEntity> findByName(String name);
}
