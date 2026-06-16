package com.siponsika.controller;

import com.siponsika.model.Pengungsi;
import com.siponsika.repository.PengungsiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pengungsi")
public class PengungsiController {

    @Autowired
    private PengungsiRepository repository;

    @GetMapping
    public List<Pengungsi> getAll() {
        return repository.findAll();
    }

    @GetMapping("/search")
    public List<Pengungsi> search(@RequestParam String nama) {
        return repository.findByNamaContainingIgnoreCase(nama);
    }

    @PostMapping
    public Pengungsi create(@RequestBody Pengungsi pengungsi) {
        return repository.save(pengungsi);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pengungsi> update(@PathVariable Long id, @RequestBody Pengungsi pengungsiDetails) {
        return repository.findById(id)
                .map(pengungsi -> {
                    pengungsi.setNama(pengungsiDetails.getNama());
                    pengungsi.setUmur(pengungsiDetails.getUmur());
                    pengungsi.setJenisKelamin(pengungsiDetails.getJenisKelamin());
                    pengungsi.setAnggotaKeluarga(pengungsiDetails.getAnggotaKeluarga());
                    pengungsi.setKondisiKesehatan(pengungsiDetails.getKondisiKesehatan());
                    pengungsi.setKamarId(pengungsiDetails.getKamarId());
                    return ResponseEntity.ok(repository.save(pengungsi));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
