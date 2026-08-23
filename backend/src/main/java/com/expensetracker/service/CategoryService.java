package com.expensetracker.service;

import com.expensetracker.dto.category.CategoryRequest;
import com.expensetracker.dto.category.CategoryResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> list(Long userId) {
        return categoryRepository.findAllByUserIdOrderByNameAsc(userId).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse create(Long userId, CategoryRequest request) {
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, request.name())) {
            throw new ConflictException("A category named '" + request.name() + "' already exists");
        }

        User user = userRepository.getReferenceById(userId);
        Category category = new Category();
        category.setUser(user);
        category.setName(request.name());
        category.setColor(request.color());
        categoryRepository.save(category);

        return CategoryResponse.from(category);
    }

    @Transactional
    public CategoryResponse update(Long userId, Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getName().equalsIgnoreCase(request.name())
                && categoryRepository.existsByUserIdAndNameIgnoreCase(userId, request.name())) {
            throw new ConflictException("A category named '" + request.name() + "' already exists");
        }

        category.setName(request.name());
        category.setColor(request.color());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (transactionRepository.existsByCategoryIdAndUserId(category.getId(), userId)) {
            throw new ConflictException("Cannot delete a category that still has transactions");
        }

        categoryRepository.delete(category);
    }
}
