package com.uade.tpo.goated.service;

import org.springframework.stereotype.Service;

import com.uade.tpo.goated.entity.Product;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockService {

    private final ProductRepository productRepository;

    public void ensureAvailable(Product product, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        if (product.getStock() <= 0) {
            throw new IllegalArgumentException(
                    String.format("\"%s\" no tiene stock disponible", product.getProductName()));
        }
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException(
                    String.format(
                            "Stock insuficiente para \"%s\". Disponible: %d",
                            product.getProductName(),
                            product.getStock()));
        }
    }

    public Product getProductForUpdate(Long productId) {
        return productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productId));
    }

    public void deductStock(Product product, int quantity) {
        ensureAvailable(product, quantity);
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }
}
