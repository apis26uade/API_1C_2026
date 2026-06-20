package com.uade.tpo.goated.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingRequest {

    @NotBlank(message = "Ingresa tu nombre completo")
    @Size(min = 3, message = "Ingresa tu nombre completo (minimo 3 caracteres)")
    private String name;

    @NotBlank(message = "Ingresa un email valido")
    @Email(message = "Ingresa un email valido")
    private String email;

    @NotBlank(message = "Ingresa un telefono valido")
    @Pattern(regexp = "^\\+?\\d{10,13}$", message = "El telefono debe tener entre 10 y 13 digitos")
    private String phone;

    @NotBlank(message = "Ingresa una direccion valida")
    @Size(min = 5, message = "Ingresa una direccion valida")
    private String address;

    @NotBlank(message = "Ingresa una ciudad valida")
    @Size(min = 2, message = "Ingresa una ciudad valida")
    private String city;

    @NotBlank(message = "Ingresa un codigo postal valido")
    @Pattern(regexp = "^[A-Za-z0-9]{4,8}$", message = "Codigo postal invalido (4 a 8 caracteres alfanumericos)")
    private String postalCode;

    private String notes;
}
