package com.uade.tpo.goated.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.goated.entity.Category;
import com.uade.tpo.goated.service.CategoryService;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("categories")
public class CategoryController {
    
    @GetMapping
    public ArrayList<Category> getCategories() {
        CategoryService categoryService = new CategoryService();
        return categoryService.getCategories();
    }
    
    @GetMapping("{categoryId}")
    public Category getCategoryById(@PathVariable int categoryId) {
        CategoryService categoryService = new CategoryService();
        return categoryService.getCategoryById(categoryId);
    }
    

    @PostMapping
    public String createCategory(@RequestBody int categoryId) {
        //TODO: process POST request
        CategoryService categoryService = new CategoryService();
        return categoryService.createCategory(categoryId);
    }
    
}
