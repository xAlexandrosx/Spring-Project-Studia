package org.example.dto.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CreateNoteRequestDto {

    @NotBlank(message = "Title cannot be blank")
    @Size(min = 3, max = 20, message = "Title must be between 3 and 20 characters")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    @Size(min = 5, max = 500, message = "Content must be between 5 and 500 characters")
    private String content;

    private int shared;

    @NotNull
    private List<Long> categoryIds = new ArrayList<>();
}