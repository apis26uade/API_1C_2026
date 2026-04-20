package com.uade.tpo.goated.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.goated.entity.CartProduct;
import com.uade.tpo.goated.service.CartProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cart-products")
@RequiredArgsConstructor
public class CartProductController {

    private final CartProductService cartProductService;

    @GetMapping("/cart/{cartId}")
    public ResponseEntity<List<CartProduct>> getItemsByCartId(@PathVariable Long cartId) {
        return ResponseEntity.ok(cartProductService.getItemsByCartId(cartId));
    }

    @PostMapping
    public ResponseEntity<CartProduct> addItem(
            @RequestParam Long cartId,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartProductService.addItem(cartId, productId, quantity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartProduct> updateItem(@PathVariable Long id, @RequestParam int quantity) {
        return ResponseEntity.ok(cartProductService.updateItem(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id) {
        cartProductService.removeItem(id);
        return ResponseEntity.noContent().build();
    }
}
