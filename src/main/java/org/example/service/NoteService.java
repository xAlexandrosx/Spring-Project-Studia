package org.example.service;

import jakarta.validation.Valid;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.note.NoteResponseDto;

import java.util.List;

public interface NoteService {

    NoteResponseDto createNote(CreateNoteRequestDto requestDto, Long ownerId);

    List<NoteResponseDto> findAll(Long ownerId);

    List<NoteResponseDto> findAllByCategoryId(List<Long> ids, Long ownerId);

    NoteResponseDto getById(Long id, Long ownerId);

    NoteResponseDto updateById(Long id, CreateNoteRequestDto requestDto, Long ownerId);

    void deleteById(Long id, Long ownerId);

    List<NoteResponseDto> findSharedNotes(Long userId);

    NoteResponseDto shareWithAllOthers(Long noteId, Long ownerId);

    List<NoteResponseDto> findAllGlobalNotesForAdmin();

    NoteResponseDto updateNoteAsAdmin(Long id, @Valid CreateNoteRequestDto requestDto);

    void deleteNoteAsAdmin(Long id);
}
