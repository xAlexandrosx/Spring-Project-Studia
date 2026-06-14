package org.example.dto.category;

import lombok.Getter;
import lombok.Setter;
import org.example.dto.user.UserResponseDto;

@Getter
@Setter
public class CategoryResponseDto {
    private Long id;
    private String name;
    private UserResponseDto owner;
}