package org.example.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.note.NoteResponseDto;
import org.example.exception.AuthenticationException;
import org.example.mapper.NoteMapper;
import org.example.model.Category;
import org.example.model.Note;
import org.example.repository.CategoryRepository;
import org.example.repository.NoteRepository;
import org.example.repository.UserRepository;
import org.example.service.NoteService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NoteMapper noteMapper;

    @Override
    @Transactional
    public NoteResponseDto createNote(CreateNoteRequestDto requestDto, Long ownerId) {
        Note note = noteMapper.toEntity(requestDto);
        note.setDateAdded(LocalDateTime.now());
        note.setShared(0);
        note.setOwner(userRepository.findUserById(ownerId).orElseThrow(
                () -> new EntityNotFoundException("Cannot find user with id: " + ownerId)
        ));

        if (requestDto.getCategoryIds() != null && !requestDto.getCategoryIds().isEmpty()) {
            note.setCategories(categoryRepository.findAllById(requestDto.getCategoryIds()));
        } else {
            note.setCategories(new ArrayList<>());
        }

        return noteMapper.toDto(noteRepository.save(note));
    }

    @Override
    public NoteResponseDto findById(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId).orElseThrow(
                () -> new EntityNotFoundException("Cannot find note by id: " + noteId)
        );

        if (note.getShared() == 1) {
            return noteMapper.toDto(note);
        }

        if (userId == null || !Objects.equals(userId, note.getOwner().getId())) {
            throw new AuthenticationException("You don't have permission to see this note because it is private.");
        }

        return noteMapper.toDto(note);
    }

    @Override
    public List<NoteResponseDto> findAll(Long ownerId) {
        return noteRepository.findAllByOwnerId(ownerId)
                .stream()
                .map(noteMapper::toDto)
                .toList();
    }

    @Override
    public List<NoteResponseDto> findAllByCategoryId(List<Long> ids, Long ownerId) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return noteRepository.findAllByCategoriesIdsIn(ids, ownerId)
                .stream()
                .map(noteMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public NoteResponseDto updateById(Long id, CreateNoteRequestDto requestDto, Long ownerId) {
        Note existingNote = noteRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Note not found or you don't have permission to modify it.")
        );

        noteMapper.updateNoteFromDto(requestDto, existingNote);

        existingNote.setShared(requestDto.getShared());

        if (requestDto.getCategoryIds() != null) {
            List<Category> freshCategories = categoryRepository.findAllById(requestDto.getCategoryIds());
            existingNote.getCategories().clear();
            existingNote.getCategories().addAll(freshCategories);
        } else {
            existingNote.getCategories().clear();
        }

        Note savedNote = noteRepository.save(existingNote);
        return noteMapper.toDto(savedNote);
    }

    @Override
    public NoteResponseDto shareById(Long id, Long ownerId) {
        Note existingNote = noteRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Note not found or you don't have permission to modify it.")
        );

        existingNote.setShared(1);

        Note savedNote = noteRepository.save(existingNote);
        return noteMapper.toDto(savedNote);
    }

    @Override
    @Transactional
    public void deleteById(Long noteId, Long ownerId) {
        Note note = noteRepository.findByIdAndOwnerId(noteId, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Note not found or you don't have permission to delete it.")
        );
        noteRepository.delete(note);
    }

    @Override
    @Transactional
    public NoteResponseDto updateNoteAsAdmin(Long id, CreateNoteRequestDto requestDto) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Note not found with id: " + id));

        note.setTitle(requestDto.getTitle());
        note.setContent(requestDto.getContent());

        Note updatedNote = noteRepository.save(note);

        return noteMapper.toDto(updatedNote);
    }

    @Override
    @Transactional
    public void deleteNoteAsAdmin(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new EntityNotFoundException("Note not found with id: " + id);
        }

        noteRepository.deleteById(id);
    }

    @Override
    public List<NoteResponseDto> findAllNotesByUserId(Long id) {
        if(!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        return noteRepository.findAllByOwnerId(id)
                .stream()
                .map(noteMapper::toDto)
                .toList();
    }

    @Override
    public NoteResponseDto setSharedStatusAsAdmin(Long id, int value) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Note not found with id: " + id));
        note.setShared(value);
        Note updatedNote = noteRepository.save(note);
        return noteMapper.toDto(updatedNote);
    }
}
