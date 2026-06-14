package org.example.service;

import org.example.dto.user.UserLoginRequestDto;
import org.example.dto.user.UserLoginResponseDto;

public interface AuthenticationService {

    UserLoginResponseDto authenticate(UserLoginRequestDto request);
}
