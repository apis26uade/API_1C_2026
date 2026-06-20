package com.uade.tpo.goated.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.goated.dto.CreateOrderRequest;
import com.uade.tpo.goated.dto.OrderWithItemsResponse;
import com.uade.tpo.goated.dto.ShippingRequest;
import com.uade.tpo.goated.entity.Cart;
import com.uade.tpo.goated.entity.CartProduct;
import com.uade.tpo.goated.entity.Discount;
import com.uade.tpo.goated.entity.Order;
import com.uade.tpo.goated.entity.OrderItem;
import com.uade.tpo.goated.entity.Product;
import com.uade.tpo.goated.entity.User;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.CartProductRepository;
import com.uade.tpo.goated.repository.CartRepository;
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
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;
    private final StockService stockService;
    private final ShippingValidator shippingValidator;

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

    public List<OrderWithItemsResponse> getOrdersWithItems() {
        return attachItems(orderRepository.findAll());
    }

    public List<OrderWithItemsResponse> getOrdersByUserIdWithItems(Long userId) {
        return attachItems(orderRepository.findByUserIdUser(userId));
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderIdOrder(orderId);
    }

    /**
     * Crea una orden a partir del carrito del usuario.
     * Valida envio, stock, descuento y que el carrito pertenezca al usuario.
     */
    @Transactional
    public Order createOrderFromCart(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + request.getUserId()));

        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado: " + request.getCartId()));

        if (!cart.getUser().getIdUser().equals(user.getIdUser())) {
            throw new IllegalArgumentException("El carrito no pertenece al usuario");
        }

        ShippingRequest shipping = shippingValidator.normalize(request.getShipping());

        List<CartProduct> items = cartProductRepository.findByCartIdCart(request.getCartId());
        if (items.isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }

        double total = items.stream()
                .mapToDouble(cp -> cp.getUnitPrice() * cp.getQuantity())
                .sum();

        Discount discount = null;
        String normalizedCode = normalizeSingleDiscountCode(request.getDiscountCode());
        if (normalizedCode != null) {
            discount = discountRepository.findByCodeAndActiveTrue(normalizedCode)
                    .orElseThrow(() -> new IllegalArgumentException("Código de descuento inválido: " + normalizedCode));
            total = total * (1.0 - discount.getPercentage() / 100.0);
        }

        Order order = Order.builder()
                .user(user)
                .status("PENDING")
                .total(total)
                .discount(discount)
                .shippingName(shipping.getName())
                .shippingEmail(shipping.getEmail())
                .shippingPhone(shipping.getPhone())
                .shippingAddress(shipping.getAddress())
                .shippingCity(shipping.getCity())
                .shippingPostalCode(shipping.getPostalCode())
                .shippingNotes(shipping.getNotes())
                .build();
        order = orderRepository.save(order);

        for (CartProduct cp : items) {
            Product product = stockService.getProductForUpdate(cp.getProduct().getIdProduct());
            stockService.deductStock(product, cp.getQuantity());

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cp.getQuantity())
                    .unitPrice(cp.getUnitPrice())
                    .build();
            orderItemRepository.save(item);
        }

        cartProductRepository.deleteByCartIdCart(request.getCartId());
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

    private String normalizeSingleDiscountCode(String discountCode) {
        if (discountCode == null || discountCode.isBlank()) {
            return null;
        }

        String normalized = discountCode.trim();
        if (normalized.contains(",") || normalized.contains(";")) {
            throw new IllegalArgumentException("Solo se permite un codigo de descuento por compra");
        }

        String[] parts = normalized.split("\\s+");
        if (parts.length > 1) {
            throw new IllegalArgumentException("Solo se permite un codigo de descuento por compra");
        }

        return parts[0];
    }

    private List<OrderWithItemsResponse> attachItems(List<Order> orders) {
        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> orderIds = orders.stream().map(Order::getIdOrder).toList();
        Map<Long, List<OrderItem>> itemsByOrderId = orderItemRepository.findByOrderIdOrderIn(orderIds)
                .stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getIdOrder()));

        List<OrderWithItemsResponse> result = new ArrayList<>(orders.size());
        for (Order order : orders) {
            List<OrderItem> items = itemsByOrderId.getOrDefault(order.getIdOrder(), Collections.emptyList());
            result.add(new OrderWithItemsResponse(order, items));
        }
        return result;
    }
}
