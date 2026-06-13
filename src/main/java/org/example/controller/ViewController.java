package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/login")
    public String showLoginPage() {
        return "auth";
    }

    @GetMapping("/loginAdmin")
    public String showAdminLoginPage() {
        return "authadmin";
    }

    @GetMapping("/dashboard")
    public String showDashboardPage() {
        return "dashboard";
    }

    @GetMapping("/admin-panel")
    public String showAdminPanelPage() {
        return "admin-panel";
    }
}