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
    public UserResponseDto createUser(UserRegistrationRequestDto requestDto) {
        if (userRepository.findByLogin(requestDto.getLogin()).isPresent()) {
            throw new RegistrationException("User with login '" + requestDto.getLogin() + "' already exists.");
        }

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
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User not found with id: " + id)
        );
        return userMapper.toDto(user);
    }

    @Override
    public UserResponseDto getUserByLogin(String login) {
        User user = (User) userRepository.findByLogin(login).orElseThrow(
                () -> new EntityNotFoundException("User not found with login: " + login)
        );
        return userMapper.toDto(user);
    }


    @Override
    public List<UserResponseDto> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .toList();
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
}