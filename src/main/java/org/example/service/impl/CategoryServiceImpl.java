package org.example.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.example.dto.category.CategoryResponseDto;
import org.example.dto.category.CreateCategoryRequestDto;
import org.example.mapper.CategoryMapper;
import org.example.model.Category;
import org.example.repository.CategoryRepository;
import org.example.repository.NoteRepository;
import org.example.repository.UserRepository;
import org.example.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final NoteRepository noteRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CategoryResponseDto create(CreateCategoryRequestDto requestDto, Long ownerId) {
        String categoryName = requestDto.getName();

        if (categoryRepository.existsByNameAndOwnerId(categoryName, ownerId)) {
            throw new IllegalArgumentException(
                    "You already have a category named '" + categoryName + "'"
            );
        }

        Category category = categoryMapper.toEntity(requestDto);
        category.setOwner(userRepository.findUserById(ownerId).orElseThrow(
                () -> new EntityNotFoundException("Cannot find user with id: " + ownerId)
        ));

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    public List<CategoryResponseDto> findAll(Long ownerId) {
        return categoryRepository.findAllByOwnerId(ownerId)
                .stream()
                .map(categoryMapper::toDto)
                .toList();
    }

    @Override
    public CategoryResponseDto getById(Long categoryId, Long ownerId) {
        Category category = categoryRepository.findByIdAndOwnerId(categoryId, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Category not found with id: " + categoryId)
        );

        return categoryMapper.toDto(category);
    }

    @Override
    @Transactional
    public CategoryResponseDto updateById(Long id, CreateCategoryRequestDto requestDto, Long ownerId) {
        Category existingCategory = categoryRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Cannot update. Category not found with id: " + id)
        );

        String newName = requestDto.getName();

        if (!existingCategory.getName().equals(newName)) {
            if (categoryRepository.existsByNameAndOwnerId(newName, ownerId)) {
                throw new IllegalArgumentException(
                        "You already have a category named '" + newName + "'"
                );
            }
        }

        categoryMapper.updateCategoryFromDto(requestDto, existingCategory);
        Category updatedCategory = categoryRepository.save(existingCategory);

        return categoryMapper.toDto(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteById(Long id, Long ownerId) {
        Category category = categoryRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Cannot find category with id: " + id)
        );

        noteRepository.deleteCategoryAssociations(id);

        categoryRepository.delete(category);
    }
}