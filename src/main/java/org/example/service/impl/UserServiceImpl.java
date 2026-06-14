package org.example.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;
import org.example.exception.RegistrationException;
import org.example.mapper.UserMapper;
import org.example.model.Role;
import org.example.model.User;
import org.example.repository.RoleRepository;
import org.example.repository.UserRepository;
import org.example.service.NoteService;
import org.example.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final NoteService noteService;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public UserResponseDto registerUser(UserRegistrationRequestDto requestDto) {
        if (userRepository.findByLogin(requestDto.getLogin()).isPresent()) {
            throw new RegistrationException("User with login '" + requestDto.getLogin() + "' already exists.");
        }

        requestDto.setPassword(passwordEncoder.encode(requestDto.getPassword()));

        User user = userMapper.toEntity(requestDto);

        Role roleFullUser = roleRepository.findByType("ROLE_FULL_USER").orElseThrow(
                () -> new EntityNotFoundException("Can't find role with type: " + "ROLE_FULL_USER")
        );
        user.setRoles(Set.of(roleFullUser));

        User savedUser = userRepository.save(user);

        CreateNoteRequestDto note = new CreateNoteRequestDto();
        note.setTitle("Welcome to Noted!");
        note.setContent("We're happy to have you with us!");
        noteService.createNote(note, savedUser.getId());

        return userMapper.toDto(savedUser);
    }

    @Override
    public List<UserResponseDto> findAllUsers() {
        List<User> rawUsers = userRepository.findAll();
        System.out.println("DATABASE VALUE: " + rawUsers.get(0).getBirthday());

        List<UserResponseDto> dtos = rawUsers.stream().map(userMapper::toDto).toList();
        System.out.println("DTO VALUE: " + dtos.get(0).getBirthday());

        return dtos;
    }

    @Override
    @Transactional
    public UserResponseDto updateUserById(UserRegistrationRequestDto requestDto, Long id) {
        User existingUser = userRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Cannot update. User not found with id: " + id)
        );

        if (!existingUser.getLogin().equals(requestDto.getLogin()) &&
                userRepository.findByLogin(requestDto.getLogin()).isPresent()) {
            throw new RegistrationException("Login '" + requestDto.getLogin() + "' is already taken.");
        }

        userMapper.updateUserFromDto(requestDto, existingUser);

        existingUser.setPassword(passwordEncoder.encode(requestDto.getPassword()));

        User updatedUser = userRepository.save(existingUser);
        return userMapper.toDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete. User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserResponseDto addUserRole(Long userId, Long roleId) {
        User existingUser = userRepository.findById(userId).orElseThrow(
                () -> new EntityNotFoundException("Cannot update. User not found with id: " + userId)
        );

        Role role = roleRepository.findById(roleId).orElseThrow(
                () -> new EntityNotFoundException("Role not found with id: " + roleId)
        );

        Set<Role> roles = existingUser.getRoles();
        if (roles.contains(role)) {
            throw new RuntimeException("User already has this role");
        }

        roles.add(role);
        existingUser.setRoles(roles);
        User savedUser = userRepository.save(existingUser);

        return userMapper.toDto(savedUser);
    }

    @Override
    public UserResponseDto removeUserRole(Long userId, Long roleId) {
        User existingUser = userRepository.findById(userId).orElseThrow(
                () -> new EntityNotFoundException("Cannot update. User not found with id: " + userId)
        );

        Role role = roleRepository.findById(roleId).orElseThrow(
                () -> new EntityNotFoundException("Role not found with id: " + roleId)
        );

        Set<Role> roles = existingUser.getRoles();

        if (!roles.contains(role)) {
            return userMapper.toDto(existingUser);
        }

        roles.remove(role);
        existingUser.setRoles(roles);
        User savedUser = userRepository.save(existingUser);

        return userMapper.toDto(savedUser);
    }

    @Override
    public Set<Role> getAllRolesFromUser(Long userId) {

        User existingUser = userRepository.findById(userId).orElseThrow(
                () -> new EntityNotFoundException("Cannot update. User not found with id: " + userId)
        );

        return existingUser.getRoles();
    }
}