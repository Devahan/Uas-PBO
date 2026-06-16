package com.siponsika.controller;

import com.siponsika.model.Posko;
import com.siponsika.repository.PoskoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posko")
public class PoskoController {

    @Autowired
    private PoskoRepository repository;

    @GetMapping
    public List<Posko> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Posko create(@RequestBody Posko posko) {
        return repository.save(posko);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Posko> update(@PathVariable Long id, @RequestBody Posko poskoDetails) {
        return repository.findById(id)
                .map(posko -> {
                    posko.setNamaPosko(poskoDetails.getNamaPosko());
                    posko.setAlamat(poskoDetails.getAlamat());
                    posko.setKapasitas(poskoDetails.getKapasitas());
                    posko.setOkupansi(poskoDetails.getOkupansi());
                    posko.setFasilitas(poskoDetails.getFasilitas());
                    return ResponseEntity.ok(repository.save(posko));
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
