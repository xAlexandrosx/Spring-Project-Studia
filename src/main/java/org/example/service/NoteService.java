package org.example.service;

import jakarta.validation.Valid;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.note.NoteResponseDto;
import java.util.List;

public interface NoteService {

    NoteResponseDto createNote(CreateNoteRequestDto requestDto, Long ownerId);

    List<NoteResponseDto> findAll(Long ownerId);

    List<NoteResponseDto> findAllByCategoryId(List<Long> ids, Long ownerId);

    NoteResponseDto updateById(Long id, CreateNoteRequestDto requestDto, Long ownerId);

    NoteResponseDto shareById(Long id, Long ownerId);

    void deleteById(Long id, Long ownerId);

    NoteResponseDto updateNoteAsAdmin(Long id, @Valid CreateNoteRequestDto requestDto);

    void deleteNoteAsAdmin(Long id);

    List<NoteResponseDto> findAllNotesByUserId(Long id);

    NoteResponseDto setSharedStatusAsAdmin(Long id, int value);

    NoteResponseDto findById(Long noteId, Long userId);
}
