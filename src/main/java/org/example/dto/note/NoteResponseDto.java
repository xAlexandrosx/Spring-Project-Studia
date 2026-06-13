package org.example.dto.note;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import org.example.dto.user.UserResponseDto;

@Data
public class NoteResponseDto {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime dateAdded;
    private List<Long> categoryIds;

    private UserResponseDto owner;
}