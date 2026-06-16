package com.siponsika.controller;

import com.siponsika.model.Kamar;
import com.siponsika.repository.KamarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kamar")
public class KamarController {

    @Autowired
    private KamarRepository repository;

    @GetMapping
    public List<Kamar> getAll() {
        return repository.findAll();
    }

    @GetMapping("/posko/{poskoId}")
    public List<Kamar> getByPosko(@PathVariable Long poskoId) {
        return repository.findByPoskoId(poskoId);
    }

    @PostMapping
    public Kamar create(@RequestBody Kamar kamar) {
        return repository.save(kamar);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Kamar> update(@PathVariable Long id, @RequestBody Kamar details) {
        return repository.findById(id)
                .map(k -> {
                    k.setPoskoId(details.getPoskoId());
                    k.setNamaKamar(details.getNamaKamar());
                    k.setKapasitas(details.getKapasitas());
                    k.setPenghuniSaatIni(details.getPenghuniSaatIni());
                    return ResponseEntity.ok(repository.save(k));
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
