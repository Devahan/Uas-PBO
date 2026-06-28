package com.siponsika.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin")
public class Admin extends BaseEntity {


    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String namaLengkap;
    private String jabatan;
    private String avatarUrl;

    public Admin() {}

    public Admin(Long id, String username, String email, String password, String namaLengkap, String jabatan, String avatarUrl) {
        this.setId(id);
        this.username = username;
        this.email = email;
        this.password = password;
        this.namaLengkap = namaLengkap;
        this.jabatan = jabatan;
        this.avatarUrl = avatarUrl;
    }

    // Getters & Setters

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNamaLengkap() { return namaLengkap; }
    public void setNamaLengkap(String namaLengkap) { this.namaLengkap = namaLengkap; }

    public String getJabatan() { return jabatan; }
    public void setJabatan(String jabatan) { this.jabatan = jabatan; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
