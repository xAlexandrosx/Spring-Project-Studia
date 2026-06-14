package org.example.service;

import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;
import org.example.model.Role;
import java.util.List;
import java.util.Set;

public interface UserService {

    UserResponseDto registerUser(UserRegistrationRequestDto requestDto);

    List<UserResponseDto> findAllUsers();

    UserResponseDto updateUserById(UserRegistrationRequestDto requestDto, Long id);

    void deleteById(Long id);

    UserResponseDto addUserRole(Long userId, Long roleId);

    UserResponseDto removeUserRole(Long userId, Long roleId);

    Set<Role> getAllRolesFromUser(Long userId);
}
