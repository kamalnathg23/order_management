package com.kamal.order_management.dto;

import com.kamal.order_management.domain.ProductEntity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public final class ProductDtos {
    private ProductDtos() {}

    public record ProductRequest(@NotBlank String name, String description,
                                 @NotNull @DecimalMin("0.01") BigDecimal price,
                                 @Min(0) int stock, String imageUrl,
                                 String category, BigDecimal mrp) {}

    public record ProductResponse(Long id, String name, String description, BigDecimal price, int stock, String imageUrl,
                                  String category, BigDecimal mrp) {
        public static ProductResponse of(ProductEntity p) {
            return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStock(), p.getImageUrl(),
                    p.getCategory(), p.getMrp());
        }
    }
}
