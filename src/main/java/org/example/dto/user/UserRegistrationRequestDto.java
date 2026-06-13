package org.example.dto.user;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.example.validation.user.Birthday;
import org.example.validation.user.FieldMatch;
import org.example.validation.user.FirstName;
import org.example.validation.user.LastName;
import org.example.validation.user.Login;
import org.example.validation.user.Password;

@Getter
@Setter
@FieldMatch(
        first = "password",
        second = "repeatPassword",
        message = "Passwords do not match."
)
public class UserRegistrationRequestDto {
    @NotBlank
    @Login
    private String login;

    @NotBlank
    @Size(min = 5, max = 20)
    @Password
    private String password;

    @NotBlank
    @Size(min = 5, max = 20)
    @Password
    private String repeatPassword;

    @NotBlank
    @FirstName
    private String firstName;

    @NotBlank
    @LastName
    private String lastName;

    @NotNull
    @Birthday
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate birthday;
}
