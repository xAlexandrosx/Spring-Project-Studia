package org.example.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.example.dto.error.ApiErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponseDto> handleIllegalStateException(
            BadCredentialsException ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.UNAUTHORIZED, "The note is no longer public.", request, null);
    }

    @ExceptionHandler({EntityNotFoundException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiErrorResponseDto> handleNotFoundException(
            Exception ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponseDto> handleBadCredentialsException(
            BadCredentialsException ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.UNAUTHORIZED, "Invalid login credentials provided.", request, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponseDto> handleAuthenticationException(
            BadCredentialsException ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.UNAUTHORIZED, "You do not have permission to perform that operation.", request, null);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiErrorResponseDto> handleAuthorizationDeniedException(
            AuthorizationDeniedException ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.UNAUTHORIZED, "Access denied.", request, null);
    }

    @ExceptionHandler(RegistrationException.class)
    public ResponseEntity<ApiErrorResponseDto> handleRegistrationException(
            BadCredentialsException ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.BAD_REQUEST, "Error during registration.", request, null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponseDto> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {

        return buildResponseEntity(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponseDto> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<String> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        return buildResponseEntity(
                HttpStatus.BAD_REQUEST,
                "Request body validation failed.",
                request,
                validationErrors
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponseDto> handleGlobalException(
            Exception ex, HttpServletRequest request) {

        ex.printStackTrace();

        return buildResponseEntity(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal server error occurred.",
                request,
                null
        );
    }

    private ResponseEntity<ApiErrorResponseDto> buildResponseEntity(
            HttpStatus status, String message, HttpServletRequest request, List<String> details) {

        ApiErrorResponseDto errorResponse = ApiErrorResponseDto.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .details(details)
                .build();

        return new ResponseEntity<>(errorResponse, status);
    }
}
