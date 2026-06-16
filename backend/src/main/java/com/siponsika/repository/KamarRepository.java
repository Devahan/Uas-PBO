package com.siponsika.repository;

import com.siponsika.model.Kamar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KamarRepository extends JpaRepository<Kamar, Long> {
    List<Kamar> findByPoskoId(Long poskoId);
}
