package org.example.mapper;

import org.example.config.MapperConfig;
import org.example.dto.category.CategoryResponseDto;
import org.example.dto.category.CreateCategoryRequestDto;
import org.example.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(config = MapperConfig.class)
public interface CategoryMapper {

    Category toEntity(CreateCategoryRequestDto requestDto);

    CategoryResponseDto toDto(Category category);

    void updateCategoryFromDto(CreateCategoryRequestDto requestDto, @MappingTarget Category category);
}
