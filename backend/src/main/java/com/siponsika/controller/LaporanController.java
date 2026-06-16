package com.siponsika.controller;

import com.siponsika.repository.KamarRepository;
import com.siponsika.repository.PengungsiRepository;
import com.siponsika.repository.PoskoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/laporan")
public class LaporanController {

    @Autowired
    private PoskoRepository poskoRepository;

    @Autowired
    private PengungsiRepository pengungsiRepository;

    @Autowired
    private KamarRepository kamarRepository;

    @GetMapping
    public Map<String, Object> getLaporan() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalPengungsi", pengungsiRepository.count());
        report.put("totalPoskoAktif", poskoRepository.count());
        
        List<Object[]> poskoData = poskoRepository.findAll().stream()
            .map(p -> new Object[]{p.getKapasitas(), p.getOkupansi()})
            .toList();
        
        long totalKapasitas = poskoData.stream().mapToLong(d -> (Integer) d[0]).sum();
        long totalOkupansi = poskoData.stream().mapToLong(d -> (Integer) d[1]).sum();
        report.put("sisaKapasitas", totalKapasitas - totalOkupansi);

        long kamarPenuh = kamarRepository.findAll().stream()
            .filter(k -> k.getPenghuniSaatIni() >= k.getKapasitas())
            .count();
        report.put("kamarPenuh", kamarPenuh);

        return report;
    }
}
