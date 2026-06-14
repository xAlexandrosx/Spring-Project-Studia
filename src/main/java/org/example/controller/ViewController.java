package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

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
        return "categories/categories"; // Resolves to templates/categories.html
    }

    @GetMapping("/login-admin")
    public String showAdminLoginPage() {
        return "login-register/login-admin"; // Points to templates/login-register/login-admin.html
    }

    @GetMapping("/admin-panel")
    public String showAdminPanelPage() {
        return "admin-panel/admin-panel"; // Resolves to templates/admin-panel/admin-panel.html
    }

    @GetMapping("/admin-usernotes-preview")
    public String showAdminUserNotesPreviewPage() {
        return "admin-panel/admin-usernotes-preview"; // Points to templates/admin-panel/admin-usernotes-preview.html
    }
}