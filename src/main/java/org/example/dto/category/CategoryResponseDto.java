package org.example.dto.category;

import lombok.Getter;
import lombok.Setter;
import org.example.dto.user.UserResponseDto;
import org.example.model.User;

@Getter
@Setter
public class CategoryResponseDto {
    private Long id;
    private String name;
    private UserResponseDto owner;
}