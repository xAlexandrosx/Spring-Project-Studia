package org.example.service;

import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;

import java.util.List;

public interface UserService {

    UserResponseDto createUser(UserRegistrationRequestDto requestDto);

    UserResponseDto getUserById(Long id);

    UserResponseDto getUserByLogin(String login);

    List<UserResponseDto> findAllUsers();

    UserResponseDto updateUserById(UserRegistrationRequestDto requestDto, Long id);

    void deleteById(Long id);
}
