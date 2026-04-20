package com.uade.tpo.goated.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.goated.entity.CartProduct;

public interface CartProductRepository extends JpaRepository<CartProduct, Long> {
    List<CartProduct> findByCartIdCart(Long cartId);
    void deleteByCartIdCart(Long cartId);
}
