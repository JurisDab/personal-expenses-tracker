package com.expensetracker.dto.category;

import com.expensetracker.entity.Category;

public record CategoryResponse(Long id, String name, String color) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getColor());
    }
}
