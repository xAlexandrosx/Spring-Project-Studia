package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;
import org.example.model.Role;
import org.example.model.User;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@Tag(name = "User Management", description = "Endpoints for managing users")
@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user",
            description = "Available to everyone. Validates and saves a new user into the database.")
    public UserResponseDto register(@RequestBody @Valid UserRegistrationRequestDto requestDto) {
        return userService.registerUser(requestDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Update a user profile",
            description = "Restricted to ADMIN users only.")
    public UserResponseDto update(
            @PathVariable Long id,
            @RequestBody @Valid UserRegistrationRequestDto updateRequestDto,
            @AuthenticationPrincipal User adminUser) {
        return userService.updateUserById(updateRequestDto, id);
    }

    @PutMapping("/addRole/{userId}/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Add a user role",
            description = "Restricted to ADMIN users only.")
    public UserResponseDto addUserRole(
            @PathVariable Long userId,
            @PathVariable Long roleId,
            @AuthenticationPrincipal User adminUser) {
        return userService.addUserRole(userId, roleId);
    }

    @PutMapping("/removeRole/{userId}/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Remove a user role",
            description = "Restricted to ADMIN users only.")
    public UserResponseDto removeUserRole(
            @PathVariable Long userId,
            @PathVariable Long roleId,
            @AuthenticationPrincipal User adminUser) {
        return userService.removeUserRole(userId, roleId);
    }

    @GetMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin View: Fetch all users currently registered in the database")
    public Set<Role> getAllRolesFromUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User adminUser) {

        return userService.getAllRolesFromUser(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user account",
            description = "Restricted to ADMIN users only.")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        userService.deleteById(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin View: Fetch all users currently registered in the database")
    public List<UserResponseDto> getAllUsers(@AuthenticationPrincipal User adminUser) {
        return userService.findAllUsers();
    }
}
