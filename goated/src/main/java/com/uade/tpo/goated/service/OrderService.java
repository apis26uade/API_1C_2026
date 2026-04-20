package com.uade.tpo.goated.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.goated.entity.CartProduct;
import com.uade.tpo.goated.entity.Discount;
import com.uade.tpo.goated.entity.Order;
import com.uade.tpo.goated.entity.OrderItem;
import com.uade.tpo.goated.entity.User;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.CartProductRepository;
import com.uade.tpo.goated.repository.DiscountRepository;
import com.uade.tpo.goated.repository.OrderItemRepository;
import com.uade.tpo.goated.repository.OrderRepository;
import com.uade.tpo.goated.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartProductRepository cartProductRepository;
    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;

    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada: " + id));
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdUser(userId);
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderIdOrder(orderId);
    }

    /**
     * Crea una orden a partir del carrito del usuario.
     * Si se pasa un código de descuento válido, se aplica al total.
     * Vacía el carrito al confirmar la orden.
     */
    @Transactional
    public Order createOrderFromCart(Long userId, Long cartId, String discountCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));

        List<CartProduct> items = cartProductRepository.findByCartIdCart(cartId);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }

        double total = items.stream()
                .mapToDouble(cp -> cp.getUnitPrice() * cp.getQuantity())
                .sum();

        Discount discount = null;
        if (discountCode != null && !discountCode.isBlank()) {
            discount = discountRepository.findByCodeAndActiveTrue(discountCode)
                    .orElseThrow(() -> new IllegalArgumentException("Código de descuento inválido: " + discountCode));
            total = total * (1.0 - discount.getPercentage() / 100.0);
        }

        Order order = Order.builder()
                .user(user)
                .status("PENDING")
                .total(total)
                .discount(discount)
                .build();
        order = orderRepository.save(order);

        for (CartProduct cp : items) {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(cp.getProduct())
                    .quantity(cp.getQuantity())
                    .unitPrice(cp.getUnitPrice())
                    .build();
            orderItemRepository.save(item);
        }

        cartProductRepository.deleteByCartIdCart(cartId);
        return order;
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Orden no encontrada: " + id);
        }
        orderRepository.deleteById(id);
    }
}
