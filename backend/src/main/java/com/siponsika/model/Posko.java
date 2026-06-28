package com.siponsika.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Posko extends BaseEntity {


    private String namaPosko;
    private String alamat;
    private Integer kapasitas;
    private Integer okupansi;
    private String fasilitas;

    public Posko() {
    }

    public Posko(Long id, String namaPosko, String alamat, Integer kapasitas, Integer okupansi, String fasilitas) {
        this.setId(id);
        this.namaPosko = namaPosko;
        this.alamat = alamat;
        this.kapasitas = kapasitas;
        this.okupansi = okupansi;
        this.fasilitas = fasilitas;
    }

    public String getNamaPosko() { return namaPosko; }
    public void setNamaPosko(String namaPosko) { this.namaPosko = namaPosko; }
    public String getAlamat() { return alamat; }
    public void setAlamat(String alamat) { this.alamat = alamat; }
    public Integer getKapasitas() { return kapasitas; }
    public void setKapasitas(Integer kapasitas) { this.kapasitas = kapasitas; }
    public Integer getOkupansi() { return okupansi; }
    public void setOkupansi(Integer okupansi) { this.okupansi = okupansi; }
    public String getFasilitas() { return fasilitas; }
    public void setFasilitas(String fasilitas) { this.fasilitas = fasilitas; }
}
