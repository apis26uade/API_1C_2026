package com.uade.tpo.goated.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.uade.tpo.goated.entity.Category;
import com.uade.tpo.goated.exception.ResourceNotFoundException;
import com.uade.tpo.goated.repository.CategoryRepository;
import com.uade.tpo.goated.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updated) {
        Category existing = getCategoryById(id);
        existing.setCategoryName(updated.getCategoryName());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoría no encontrada: " + id);
        }
        if (!productRepository.findByCategoryIdCategory(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "No se puede eliminar una categoria que tiene productos asociados");
        }
        categoryRepository.deleteById(id);
    }
}
