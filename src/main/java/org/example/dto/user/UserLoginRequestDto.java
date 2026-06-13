package org.example.dto.user;

import lombok.Getter;
import lombok.Setter;
import org.example.validation.user.Login;
import org.example.validation.user.Password;

@Getter
@Setter
public class UserLoginRequestDto {

    @Login
    private String login;

    @Password
    private String password;
}