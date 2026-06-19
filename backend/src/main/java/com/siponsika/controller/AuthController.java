package com.siponsika.controller;

import com.siponsika.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminService adminService;

    public AuthController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * POST /api/auth/login
     * Body: { "usernameOrEmail": "admin", "password": "admin123" }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String usernameOrEmail = request.get("usernameOrEmail");
        String password = request.get("password");

        if (usernameOrEmail == null || usernameOrEmail.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Username/email dan password harus diisi."));
        }

        Map<String, Object> result = adminService.login(usernameOrEmail, password);

        if (result == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Username atau password salah."));
        }

        result.put("success", true);
        result.put("message", "Login berhasil. Selamat datang, " + result.get("namaLengkap") + "!");
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/auth/logout
     * (Sesi dikelola di sisi klien melalui sessionStorage)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logout berhasil."));
    }

    /**
     * GET /api/auth/admins
     * Menampilkan daftar semua admin (untuk debugging/manajemen).
     */
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }
}
