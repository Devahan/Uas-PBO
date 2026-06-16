package com.siponsika.repository;

import com.siponsika.model.Posko;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoskoRepository extends JpaRepository<Posko, Long> {
}
