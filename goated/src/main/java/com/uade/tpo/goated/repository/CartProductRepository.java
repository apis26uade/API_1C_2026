package com.uade.tpo.goated.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.goated.entity.CartProduct;

public interface CartProductRepository extends JpaRepository<CartProduct, Long> {
    List<CartProduct> findByCartIdCart(Long cartId);

    Optional<CartProduct> findByCartIdCartAndProductIdProduct(Long cartId, Long productId);

    @Modifying
    @Transactional
    void deleteByCartIdCart(Long cartId);

    @Modifying
    @Transactional
    void deleteByProductIdProduct(Long productId);
}