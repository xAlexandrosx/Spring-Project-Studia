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
@PreAuthorize("hasRole('FULL_USER')")
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new note")
    public NoteResponseDto createNote(
            @Valid @RequestBody CreateNoteRequestDto request,
            @AuthenticationPrincipal User user) {

        return noteService.createNote(request, user.getId());
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get all notes owned by the logged-in user")
    public List<NoteResponseDto> findAll(
            @AuthenticationPrincipal User user,
            Pageable pageable) {

        return noteService.findAll(user.getId());
    }

    @GetMapping("/shared")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get all notes shared WITH the logged-in user")
    public List<NoteResponseDto> findShared(@AuthenticationPrincipal User user) {
        return noteService.findSharedNotes(user.getId());
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get a specific note by its ID (Owned or Shared)")
    public NoteResponseDto getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return noteService.getById(id, user.getId());
    }

    @GetMapping("/by-categories")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Get notes filtered by specific category IDs")
    public List<NoteResponseDto> findAllByCategories(
            @RequestParam List<Long> ids,
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        return noteService.findAllByCategoryId(ids, user.getId());
    }

    @PostMapping("/{id}/share")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Share an owned note with every other user in the system")
    public NoteResponseDto shareNote(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return noteService.shareWithAllOthers(id, user.getId());
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Update an existing note by its ID")
    public NoteResponseDto updateById(
            @PathVariable Long id,
            @Valid @RequestBody CreateNoteRequestDto requestDto,
            @AuthenticationPrincipal User user) {
        return noteService.updateById(id, requestDto, user.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a note by its ID")
    public void deleteById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        noteService.deleteById(id, user.getId());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin View: Get every single note on the entire platform")
    public List<NoteResponseDto> adminGetAllGlobalNotes() {
        return noteService.findAllGlobalNotesForAdmin();
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Admin Override: Force update any note to fix TOS violations")
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
}