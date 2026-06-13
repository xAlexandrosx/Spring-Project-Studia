package org.example.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.note.NoteResponseDto;
import org.example.mapper.NoteMapper;
import org.example.model.Note;
import org.example.model.User;
import org.example.repository.CategoryRepository;
import org.example.repository.NoteRepository;
import org.example.repository.UserRepository;
import org.example.service.NoteService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    public NoteResponseDto getById(Long id, Long userId) {
        return noteRepository.findByIdAndOwnerId(id, userId)
                .map(noteMapper::toDto)
                .orElseGet(() -> noteRepository.findSharedNoteByIdAndUserId(id, userId)
                        .map(noteMapper::toDto)
                        .orElseThrow(() -> new EntityNotFoundException("Cannot find note with id: " + id + " or access denied."))
                );
    }

    @Override
    @Transactional
    public NoteResponseDto updateById(Long id, CreateNoteRequestDto requestDto, Long ownerId) {
        Note existingNote = noteRepository.findByIdAndOwnerId(id, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Note not found or you don't have permission to modify it.")
        );

        noteMapper.updateNoteFromDto(requestDto, existingNote);

        if (requestDto.getCategoryIds() != null && !requestDto.getCategoryIds().isEmpty()) {
            existingNote.setCategories(categoryRepository.findAllById(requestDto.getCategoryIds()));
        } else {
            existingNote.setCategories(new ArrayList<>());
        }

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
    public List<NoteResponseDto> findSharedNotes(Long userId) {
        return noteRepository.findAllBySharedUsersId(userId)
                .stream()
                .map(noteMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public NoteResponseDto shareWithAllOthers(Long noteId, Long ownerId) {
        Note note = noteRepository.findByIdAndOwnerId(noteId, ownerId).orElseThrow(
                () -> new EntityNotFoundException("Note not found or you don't have permission to share it.")
        );

        List<User> allOtherUsers = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(ownerId))
                .collect(Collectors.toCollection(ArrayList::new));

        note.setSharedUsers(allOtherUsers);
        Note savedNote = noteRepository.save(note);

        return noteMapper.toDto(savedNote);
    }

    @Override
    public List<NoteResponseDto> findAllGlobalNotesForAdmin() {
        List<Note> allNotes = noteRepository.findAll();

        return allNotes.stream()
                .map(noteMapper::toDto)
                .toList();
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
}
