package org.example.mapper;

import org.example.config.MapperConfig;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.note.NoteResponseDto;
import org.example.model.Category;
import org.example.model.Note;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(config = MapperConfig.class)
public interface NoteMapper {

    @Mapping(target = "categories", ignore = true)
    Note toEntity(CreateNoteRequestDto requestDto);

    @Mapping(target = "categoryIds", source = "categories", qualifiedByName = "mapCategoriesToIds")
    NoteResponseDto toDto(Note note);

    @Mapping(target = "categories", ignore = true)
    void updateNoteFromDto(CreateNoteRequestDto requestDto, @MappingTarget Note note);

    @Named("mapCategoriesToIds")
    default List<Long> mapCategoriesToIds(List<Category> categories) {
        if (categories == null) {
            return null;
        }
        return categories.stream()
                .map(Category::getId)
                .collect(Collectors.toList());
    }
}