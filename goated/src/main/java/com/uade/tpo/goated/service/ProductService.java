package com.uade.tpo.goated.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.goated.entity.Category;
import com.uade.tpo.goated.entity.Product;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.CartProductRepository;
import com.uade.tpo.goated.repository.CategoryRepository;
import com.uade.tpo.goated.repository.OrderItemRepository;
import com.uade.tpo.goated.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartProductRepository cartProductRepository;
    private final OrderItemRepository orderItemRepository;

    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdCategory(categoryId);
    }

    public Product createProduct(Product product) {
        Category category = categoryRepository.findById(product.getCategory().getIdCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        product.setCategory(category);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);
        Category category = categoryRepository.findById(updated.getCategory().getIdCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        existing.setCategory(category);
        existing.setProductName(updated.getProductName());
        existing.setProductDescription(updated.getProductDescription());
        existing.setPrice(updated.getPrice());
        existing.setStock(updated.getStock());
        existing.setImageProduct(updated.getImageProduct());
        return productRepository.save(existing);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado: " + id);
        }
        if (orderItemRepository.existsInActiveOrderByProductId(id)) {
            throw new IllegalArgumentException(
                    "No se puede eliminar un producto que figura en un pedido activo (no cancelado)");
        }
        orderItemRepository.deleteByProductIdProduct(id);
        cartProductRepository.deleteByProductIdProduct(id);
        productRepository.deleteById(id);
    }
}
