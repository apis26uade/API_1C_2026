package com.uade.tpo.goated.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Long userId;

    @NotNull(message = "El carrito es obligatorio")
    private Long cartId;

    private String discountCode;

    @Valid
    @NotNull(message = "Los datos de envio son obligatorios")
    private ShippingRequest shipping;
}
