package com.uade.tpo.goated.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.goated.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderIdOrder(Long orderId);

    List<OrderItem> findByOrderIdOrderIn(Collection<Long> orderIds);

    @Query("""
            SELECT COUNT(oi) > 0
            FROM OrderItem oi
            WHERE oi.product.idProduct = :productId
              AND oi.order.status <> 'CANCELLED'
            """)
    boolean existsInActiveOrderByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    void deleteByProductIdProduct(Long productId);
}
