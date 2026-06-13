package org.example.validation.user;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LastNameValidator.class)
public @interface LastName {

    String message() default "Last name must be 3-50 characters long, contain only letters, and start with a single uppercase letter";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}