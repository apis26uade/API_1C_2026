package com.uade.tpo.goated.service;

import org.springframework.stereotype.Component;

import com.uade.tpo.goated.dto.ShippingRequest;

@Component
public class ShippingValidator {

    public ShippingRequest normalize(ShippingRequest shipping) {
        if (shipping == null) {
            throw new IllegalArgumentException("Los datos de envio son obligatorios");
        }

        String phone = shipping.getPhone() == null ? "" : shipping.getPhone().replaceAll("\\D", "");
        if (shipping.getPhone() != null && shipping.getPhone().trim().startsWith("+")) {
            phone = "+" + phone.replace("+", "");
        }

        String notes = shipping.getNotes() == null ? null : shipping.getNotes().trim();
        if (notes != null && notes.isBlank()) {
            notes = null;
        }

        return ShippingRequest.builder()
                .name(shipping.getName().trim())
                .email(shipping.getEmail().trim())
                .phone(phone)
                .address(shipping.getAddress().trim())
                .city(shipping.getCity().trim())
                .postalCode(shipping.getPostalCode().trim().toUpperCase())
                .notes(notes)
                .build();
    }
}
