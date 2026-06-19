package com.siponsika.service;

import com.siponsika.model.Admin;
import com.siponsika.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    /**
     * Melakukan autentikasi admin berdasarkan username/email dan password.
     * Mengembalikan data admin (tanpa password) jika berhasil, null jika gagal.
     */
    public Map<String, Object> login(String usernameOrEmail, String password) {
        Optional<Admin> adminOpt = adminRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (adminOpt.isEmpty()) {
            return null;
        }

        Admin admin = adminOpt.get();

        // Validasi password (plain text – cocok untuk tugas akademik)
        if (!admin.getPassword().equals(password)) {
            return null;
        }

        // Kembalikan data admin tanpa password
        Map<String, Object> result = new HashMap<>();
        result.put("id", admin.getId());
        result.put("username", admin.getUsername());
        result.put("email", admin.getEmail());
        result.put("namaLengkap", admin.getNamaLengkap());
        result.put("jabatan", admin.getJabatan());
        result.put("avatarUrl", admin.getAvatarUrl());
        result.put("token", generateSimpleToken(admin));

        return result;
    }

    /**
     * Membuat token sederhana berbasis base64 untuk keperluan sesi.
     */
    private String generateSimpleToken(Admin admin) {
        String raw = admin.getId() + ":" + admin.getUsername() + ":" + System.currentTimeMillis();
        return java.util.Base64.getEncoder().encodeToString(raw.getBytes());
    }

    /**
     * Mendapatkan semua admin (untuk keperluan manajemen).
     */
    public java.util.List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    /**
     * Mendapatkan admin berdasarkan ID.
     */
    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    /**
     * Membuat admin baru.
     */
    public Admin createAdmin(Admin admin) {
        return adminRepository.save(admin);
    }
}
