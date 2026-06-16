package com.siponsika.config;

import com.siponsika.model.Kamar;
import com.siponsika.model.Pengungsi;
import com.siponsika.model.Posko;
import com.siponsika.repository.KamarRepository;
import com.siponsika.repository.PengungsiRepository;
import com.siponsika.repository.PoskoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PoskoRepository poskoRepository;
    private final PengungsiRepository pengungsiRepository;
    private final KamarRepository kamarRepository;

    public DataInitializer(PoskoRepository poskoRepository, PengungsiRepository pengungsiRepository, KamarRepository kamarRepository) {
        this.poskoRepository = poskoRepository;
        this.pengungsiRepository = pengungsiRepository;
        this.kamarRepository = kamarRepository;
    }

    @Override
    public void run(String... args) {
        if (poskoRepository.count() > 0) return;

        Posko p1 = new Posko(null, "Posko Merapi 01", "Jl. Merbabu No. 10, Cangkringan", 200, 184, "Tenda, MCK, Dapur Umum");
        Posko p2 = new Posko(null, "Posko Merapi 02", "Jl. Kaliurang Km 22, Pakem", 150, 68, "Tenda, MCK, Dapur Umum");
        Posko p3 = new Posko(null, "Posko Merapi 03", "Jl. Boyong, Turgo", 100, 78, "Tenda, MCK");
        Posko p4 = new Posko(null, "Stadion Patriot Bhakti", "Jl. Sudirman No. 45", 1500, 1250, "Tenda, MCK, Dapur Umum, Lahan Parkir");
        Posko p5 = new Posko(null, "GOR Bung Hatta", "Kecamatan Kebon Jeruk", 1000, 450, "Tenda, MCK, Dapur Umum");
        Posko p6 = new Posko(null, "Balai Desa Makmur", "Jl. Melati No. 12", 300, 295, "Tenda, MCK");
        poskoRepository.saveAll(java.util.List.of(p1, p2, p3, p4, p5, p6));

        Pengungsi ps1 = new Pengungsi(null, "Budi Pratama", 34, "Laki-laki", 4, "Sehat", null);
        Pengungsi ps2 = new Pengungsi(null, "Laras Santoso", 28, "Perempuan", 2, "Luka Ringan", null);
        Pengungsi ps3 = new Pengungsi(null, "Siti Yuliani", 52, "Perempuan", 3, "Luka Berat", null);
        Pengungsi ps4 = new Pengungsi(null, "Ahmad Sulaiman", 42, "Laki-laki", 4, "Sehat", null);
        Pengungsi ps5 = new Pengungsi(null, "Siti Aminah", 38, "Perempuan", 3, "Luka Ringan", null);
        Pengungsi ps6 = new Pengungsi(null, "Bambang Hartono", 65, "Laki-laki", 1, "Kritis", null);
        Pengungsi ps7 = new Pengungsi(null, "Dewi Sartika", 22, "Perempuan", 2, "Sehat", null);
        Pengungsi ps8 = new Pengungsi(null, "Rudi Hermawan", 45, "Laki-laki", 5, "Sehat", null);
        pengungsiRepository.saveAll(java.util.List.of(ps1, ps2, ps3, ps4, ps5, ps6, ps7, ps8));

        Kamar k1 = new Kamar(null, 1L, "A-01", 4, 4);
        Kamar k2 = new Kamar(null, 1L, "A-02", 4, 3);
        Kamar k3 = new Kamar(null, 1L, "A-03", 4, 2);
        Kamar k4 = new Kamar(null, 2L, "B-01", 6, 6);
        Kamar k5 = new Kamar(null, 2L, "B-02", 6, 4);
        kamarRepository.saveAll(java.util.List.of(k1, k2, k3, k4, k5));
    }
}
