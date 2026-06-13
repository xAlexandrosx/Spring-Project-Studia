package org.example.service;

import org.example.dto.user.UserLoginRequestDto;
import org.example.dto.user.UserLoginResponseDto;
import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;

public interface AuthenticationService {

    UserResponseDto registerUser(UserRegistrationRequestDto requestDto);

    UserLoginResponseDto loginUser(UserLoginRequestDto requestDto);
}
