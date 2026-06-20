package com.uade.tpo.goated.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.goated.entity.Cart;
import com.uade.tpo.goated.entity.CartProduct;
import com.uade.tpo.goated.entity.Product;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.CartProductRepository;
import com.uade.tpo.goated.repository.CartRepository;
import com.uade.tpo.goated.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartProductService {

    private final CartProductRepository cartProductRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;

    public List<CartProduct> getItemsByCartId(Long cartId) {
        return cartProductRepository.findByCartIdCart(cartId);
    }

    public CartProduct getCartProductById(Long id) {
        return cartProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de carrito no encontrado: " + id));
    }

    @Transactional
    public CartProduct addItem(Long cartId, Long productId, int quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado: " + cartId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productId));

        var existing = cartProductRepository.findByCartIdCartAndProductIdProduct(cartId, productId);
        int targetQuantity = existing.map(item -> item.getQuantity() + quantity).orElse(quantity);

        stockService.ensureAvailable(product, targetQuantity);

        if (existing.isPresent()) {
            CartProduct item = existing.get();
            item.setQuantity(targetQuantity);
            item.setUnitPrice(product.getPrice());
            return cartProductRepository.save(item);
        }

        CartProduct item = CartProduct.builder()
                .cart(cart)
                .product(product)
                .unitPrice(product.getPrice())
                .quantity(targetQuantity)
                .build();

        return cartProductRepository.save(item);
    }

    @Transactional
    public CartProduct updateItem(Long id, int quantity) {
        CartProduct item = getCartProductById(id);
        Product product = productRepository.findById(item.getProduct().getIdProduct())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Producto no encontrado: " + item.getProduct().getIdProduct()));

        stockService.ensureAvailable(product, quantity);
        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        return cartProductRepository.save(item);
    }

    public void removeItem(Long id) {
        if (!cartProductRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item de carrito no encontrado: " + id);
        }
        cartProductRepository.deleteById(id);
    }

    @Transactional
    public void clearCart(Long cartId) {
        cartProductRepository.deleteByCartIdCart(cartId);
    }
}
