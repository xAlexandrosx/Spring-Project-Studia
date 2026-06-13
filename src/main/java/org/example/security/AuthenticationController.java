package org.example.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.user.UserLoginRequestDto;
import org.example.dto.user.UserLoginResponseDto;
import org.example.dto.user.UserRegistrationRequestDto;
import org.example.dto.user.UserResponseDto;
import org.example.model.User;
import org.example.service.AuthenticationService;
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

@Tag(name = "Authentication Manager", description = "Endpoints for managing user authentication and accounts")
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/auth")
public class AuthenticationController {

    private final UserService userService;
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user",
            description = "Available to everyone. Validates and saves a new user into the database.")
    public UserResponseDto register(@RequestBody @Valid UserRegistrationRequestDto requestDto) {
        return authenticationService.registerUser(requestDto);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Login a user",
            description = "Available to everyone. Authenticates credentials and returns a JWT/session token.")
    public UserLoginResponseDto login(@RequestBody @Valid UserLoginRequestDto loginRequestDto) {
        return authenticationService.loginUser(loginRequestDto);
    }

    @PutMapping("/users/{id}")
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

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user account",
            description = "Restricted to ADMIN users only.")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        userService.deleteById(id);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin View: Fetch all users currently registered in the database")
    public List<UserResponseDto> getAllUsers() {
        return userService.findAllUsers();
    }
}