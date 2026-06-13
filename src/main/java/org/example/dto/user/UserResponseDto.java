package org.example.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDto {
    private Long id;
    private String login;
    private String firstName;
    private String lastName;
}
