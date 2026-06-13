package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.example.dto.category.CategoryResponseDto;
import org.example.dto.category.CreateCategoryRequestDto;
import org.example.model.User;
import org.example.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Category Management", description = "Endpoints for managing categories")
@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/categories")
@PreAuthorize("hasRole('FULL_USER')")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // 201 Created
    @Operation(summary = "Create a new category")
    public CategoryResponseDto create(
            @Valid @RequestBody CreateCategoryRequestDto requestDto,
            @AuthenticationPrincipal User user) {
        return categoryService.create(requestDto, user.getId());
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK) // 200 OK
    @Operation(summary = "Get all categories belonging to the logged-in user")
    public List<CategoryResponseDto> getAllMyCategories(@AuthenticationPrincipal User user) {
        return categoryService.findAll(user.getId());
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK) // 200 OK
    @Operation(summary = "Get a specific category by its ID")
    public CategoryResponseDto getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return categoryService.getById(id, user.getId());
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK) // 200 OK
    @Operation(summary = "Update an existing category by its ID")
    public CategoryResponseDto updateById(
            @PathVariable Long id,
            @Valid @RequestBody CreateCategoryRequestDto requestDto,
            @AuthenticationPrincipal User user) {
        return categoryService.updateById(id, requestDto, user.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204 No Content
    @Operation(summary = "Delete a category by its ID")
    public void deleteById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        categoryService.deleteById(id, user.getId());
    }
}