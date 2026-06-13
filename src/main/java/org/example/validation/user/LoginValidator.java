package org.example.validation.user;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LoginValidator implements ConstraintValidator<Login, String> {

    private static final String LOGIN_PATTERN = "^[a-z]+$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        int length = value.length();

        if (length < 3 || length > 20) {
            return false;
        }

        return value.matches(LOGIN_PATTERN);
    }
}