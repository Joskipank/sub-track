package com.subscriptionmanager.category.service;

import com.subscriptionmanager.category.dto.CategoryResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Override
    public List<CategoryResponse> list() {
        return List.of();
    }
}
