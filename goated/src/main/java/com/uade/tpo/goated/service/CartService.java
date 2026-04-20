package com.uade.tpo.goated.service;

import org.springframework.stereotype.Service;

import com.uade.tpo.goated.entity.Cart;
import com.uade.tpo.goated.entity.User;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.CartRepository;
import com.uade.tpo.goated.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public Cart getCartById(Long id) {
        return cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado: " + id));
    }

    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserIdUser(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado para el usuario: " + userId));
    }

    public Cart createCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));
        Cart cart = Cart.builder().user(user).build();
        return cartRepository.save(cart);
    }

    public void deleteCart(Long id) {
        if (!cartRepository.existsById(id)) {
            throw new ResourceNotFoundException("Carrito no encontrado: " + id);
        }
        cartRepository.deleteById(id);
    }
}
