package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.example.dto.note.CreateNoteRequestDto;
import org.example.dto.note.NoteResponseDto;
import org.example.model.User;
import org.example.service.NoteService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Note Management", description = "Endpoints for managing notes")
@RestController
@AllArgsConstructor
@RequestMapping(value = "/api/notes")
public class NoteController {

    private final NoteService noteService;

    @PreAuthorize("hasRole('FULL_USER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new note")
    public NoteResponseDto createNote(
            @Valid @RequestBody CreateNoteRequestDto request,
            @AuthenticationPrincipal User user) {

        return noteService.createNote(request, user.getId());
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get a single note by its ID")
    public NoteResponseDto findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return noteService.findById(id, user.getId());
    }

    @PreAuthorize("hasRole('FULL_USER')")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get all notes owned by the logged-in user")
    public List<NoteResponseDto> findAll(
            @AuthenticationPrincipal User user) {

        return noteService.findAll(user.getId());
    }

    @PreAuthorize("hasRole('FULL_USER')")
    @GetMapping("/by-categories")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get notes filtered by specific category IDs")
    public List<NoteResponseDto> findAllByCategories(
            @RequestParam List<Long> ids,
            @AuthenticationPrincipal User user) {
        return noteService.findAllByCategoryId(ids, user.getId());
    }

    @PreAuthorize("hasRole('FULL_USER')")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Update an existing note by its ID")
    public NoteResponseDto updateById(
            @PathVariable Long id,
            @Valid @RequestBody CreateNoteRequestDto requestDto,
            @AuthenticationPrincipal User user) {
        return noteService.updateById(id, requestDto, user.getId());
    }

    @PreAuthorize("hasRole('FULL_USER')")
    @PutMapping("/share/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Share a note with others")
    public NoteResponseDto shareById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return noteService.shareById(id, user.getId());
    }

    @PreAuthorize("hasRole('FULL_USER')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a note by its ID")
    public void deleteById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        noteService.deleteById(id, user.getId());
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin View: Get every single note from a user.")
    public List<NoteResponseDto> adminGetAllNotesByUserId(@PathVariable Long id) {
        return noteService.findAllNotesByUserId(id);
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin Override: Force update any note")
    public NoteResponseDto adminOverrideNote(
            @PathVariable Long id,
            @Valid @RequestBody CreateNoteRequestDto requestDto) {
        return noteService.updateNoteAsAdmin(id, requestDto);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Admin Purge: Drop any note instantly from the platform")
    public void adminPurgeNote(@PathVariable Long id) {
        noteService.deleteNoteAsAdmin(id);
    }

    @PutMapping("/admin/setShare/{id}/{value}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin Override: change visibility of a note")
    public NoteResponseDto adminSetNoteSharedStatus(
            @PathVariable Long id,
            @PathVariable int value) {
        return noteService.setSharedStatusAsAdmin(id, value);
    }
}
