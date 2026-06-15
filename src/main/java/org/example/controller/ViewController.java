package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String showIndexPage() {
        return "index";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "login-register/login";
    }

    @GetMapping("/my-notes")
    public String showMyNotesPage() {
        return "my-notes/my-notes";
    }

    @GetMapping("/note-editor")
    public String showNoteEditorPage() {
        return "note-editor/note-editor";
    }

    @GetMapping("/note-viewer")
    public String showNoteViewerPage() {
        return "note-viewer/note-viewer";
    }

    @GetMapping("/categories")
    public String showCategoriesPage() {
        return "categories/categories";
    }

    @GetMapping("/login-admin")
    public String showAdminLoginPage() {
        return "login-register/login-admin";
    }

    @GetMapping("/admin-panel")
    public String showAdminPanelPage() {
        return "admin-panel/admin-panel";
    }

    @GetMapping("/admin-usernotes-preview")
    public String showAdminUserNotesPreviewPage() {
        return "admin-panel/admin-usernotes-preview";
    }
}