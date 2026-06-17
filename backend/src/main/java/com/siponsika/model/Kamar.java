package com.siponsika.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Kamar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long poskoId;
    private String namaKamar;
    private Integer kapasitas;
    private Integer penghuniSaatIni;

    public Kamar() {
    }

    public Kamar(Long id, Long poskoId, String namaKamar, Integer kapasitas, Integer penghuniSaatIni) {
        this.id = id;
        this.poskoId = poskoId;
        this.namaKamar = namaKamar;
        this.kapasitas = kapasitas;
        this.penghuniSaatIni = penghuniSaatIni;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPoskoId() { return poskoId; }
    public void setPoskoId(Long poskoId) { this.poskoId = poskoId; }
    public String getNamaKamar() { return namaKamar; }
    public void setNamaKamar(String namaKamar) { this.namaKamar = namaKamar; }
    public Integer getKapasitas() { return kapasitas; }
    public void setKapasitas(Integer kapasitas) { this.kapasitas = kapasitas; }
    public Integer getPenghuniSaatIni() { return penghuniSaatIni; }
    public void setPenghuniSaatIni(Integer penghuniSaatIni) { this.penghuniSaatIni = penghuniSaatIni; }
}
