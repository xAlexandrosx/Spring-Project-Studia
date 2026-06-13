package org.example.service;

import org.example.dto.category.CategoryResponseDto;
import org.example.dto.category.CreateCategoryRequestDto;

import java.util.List;

public interface CategoryService {

    CategoryResponseDto create(CreateCategoryRequestDto requestDto, Long ownerId);

    List<CategoryResponseDto> findAll(Long ownerId);

    CategoryResponseDto getById(Long id, Long ownerId);

    CategoryResponseDto updateById(Long id, CreateCategoryRequestDto requestDto, Long ownerId);

    void deleteById(Long id, Long ownerId);
}