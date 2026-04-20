package com.uade.tpo.goated.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.uade.tpo.goated.entity.Discount;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.DiscountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;

    public List<Discount> getDiscounts() {
        return discountRepository.findAll();
    }

    public Discount getDiscountById(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Descuento no encontrado: " + id));
    }

    public Discount getDiscountByCode(String code) {
        return discountRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Código de descuento inválido o inactivo: " + code));
    }

    public Discount createDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    public Discount updateDiscount(Long id, Discount updated) {
        Discount existing = getDiscountById(id);
        existing.setCode(updated.getCode());
        existing.setPercentage(updated.getPercentage());
        existing.setValidFrom(updated.getValidFrom());
        existing.setValidTo(updated.getValidTo());
        existing.setActive(updated.isActive());
        return discountRepository.save(existing);
    }

    public void deleteDiscount(Long id) {
        if (!discountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Descuento no encontrado: " + id);
        }
        discountRepository.deleteById(id);
    }
}
