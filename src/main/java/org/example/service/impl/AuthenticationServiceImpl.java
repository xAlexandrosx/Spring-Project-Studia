package org.example.service.impl;

import lombok.AllArgsConstructor;
import org.example.dto.user.UserLoginRequestDto;
import org.example.dto.user.UserLoginResponseDto;
import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.example.security.JwtUtil;
import org.example.service.AuthenticationService;
import org.example.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public UserLoginResponseDto authenticate(UserLoginRequestDto request) {

        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword())
        );

        String token = jwtUtil.generateToken(authenticate.getName());
        UserLoginResponseDto loginResponse = new UserLoginResponseDto();
        loginResponse.setToken(token);

        return loginResponse;
    }
}