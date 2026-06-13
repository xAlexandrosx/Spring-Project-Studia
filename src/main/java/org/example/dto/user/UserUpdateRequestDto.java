package org.example.dto.user;

import lombok.Getter;
import lombok.Setter;
import org.example.validation.user.Birthday;
import org.example.validation.user.FirstName;
import org.example.validation.user.LastName;

import java.time.LocalDate;

@Getter
@Setter
public class UserUpdateRequestDto {

    @FirstName
    private String firstNames;

    @LastName
    private String lastNames;

    @Birthday
    private LocalDate birthday;
}