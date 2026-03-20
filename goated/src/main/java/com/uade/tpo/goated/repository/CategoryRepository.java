package com.uade.tpo.goated.repository;

import java.util.ArrayList;
import java.util.Arrays;

import com.uade.tpo.goated.entity.Category;

public class CategoryRepository {
    public ArrayList<Category> categories = new ArrayList<Category>(
        Arrays.asList(Category.builder().description("Buzos").id(1).build(),
        Category.builder().description("Remeras").id(2).build(),
        Category.builder().description("Gorras").id(3).build())
    );

    public ArrayList<Category> getCategories() {
        return this.categories;
    }
    
    
    public String getCategoryById(String categoryId) {
        return null;
    }

    
    public String createCategory(String entity) {
        //TODO: process POST request
        
        return null;
    }
}
