package org.example.validation.user;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LastNameValidator implements ConstraintValidator<LastName, String> {

    private static final String NAME_PATTERN = "^[A-Z][a-z]*$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        int length = value.length();

        if (length < 3 || length > 50) {
            return false;
        }

        return value.matches(NAME_PATTERN);
    }
}
