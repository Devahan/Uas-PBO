package com.siponsika.repository;

import com.siponsika.model.Pengungsi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PengungsiRepository extends JpaRepository<Pengungsi, Long> {
    List<Pengungsi> findByNamaContainingIgnoreCase(String nama);
}
