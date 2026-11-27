package com.kamal.order_management.service;

import com.kamal.order_management.domain.ProductEntity;
import com.kamal.order_management.dto.ProductDtos.*;
import com.kamal.order_management.exception.ResourceNotFoundException;
import com.kamal.order_management.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    public List<ProductResponse> findAll() { return repo.findAll().stream().map(ProductResponse::of).toList(); }

    public ProductResponse findById(Long id) { return ProductResponse.of(get(id)); }

    @Transactional
    public ProductResponse create(ProductRequest r) {
        ProductEntity p = new ProductEntity();
        apply(p, r);
        return ProductResponse.of(repo.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest r) {
        ProductEntity p = get(id);
        apply(p, r);
        return ProductResponse.of(p);
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(get(id));
        repo.flush();
    }

    private ProductEntity get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private void apply(ProductEntity p, ProductRequest r) {
        p.setName(r.name());
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setStock(r.stock());
        p.setImageUrl(r.imageUrl());
        p.setCategory(r.category());
        if (r.mrp() != null && r.mrp().compareTo(r.price()) < 0)
            throw new com.kamal.order_management.exception.BadRequestException("MRP cannot be lower than price");
        p.setMrp(r.mrp());
    }
}
