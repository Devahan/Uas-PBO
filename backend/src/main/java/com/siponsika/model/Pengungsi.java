package com.siponsika.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Pengungsi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nama;
    private Integer umur;
    private String jenisKelamin;
    private Integer anggotaKeluarga;
    private String kondisiKesehatan;
    private Long kamarId;

    public Pengungsi() {
    }

    public Pengungsi(Long id, String nama, Integer umur, String jenisKelamin, Integer anggotaKeluarga, String kondisiKesehatan, Long kamarId) {
        this.id = id;
        this.nama = nama;
        this.umur = umur;
        this.jenisKelamin = jenisKelamin;
        this.anggotaKeluarga = anggotaKeluarga;
        this.kondisiKesehatan = kondisiKesehatan;
        this.kamarId = kamarId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }
    public Integer getUmur() { return umur; }
    public void setUmur(Integer umur) { this.umur = umur; }
    public String getJenisKelamin() { return jenisKelamin; }
    public void setJenisKelamin(String jenisKelamin) { this.jenisKelamin = jenisKelamin; }
    public Integer getAnggotaKeluarga() { return anggotaKeluarga; }
    public void setAnggotaKeluarga(Integer anggotaKeluarga) { this.anggotaKeluarga = anggotaKeluarga; }
    public String getKondisiKesehatan() { return kondisiKesehatan; }
    public void setKondisiKesehatan(String kondisiKesehatan) { this.kondisiKesehatan = kondisiKesehatan; }
    public Long getKamarId() { return kamarId; }
    public void setKamarId(Long kamarId) { this.kamarId = kamarId; }
}
