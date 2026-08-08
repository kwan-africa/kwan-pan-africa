package com.kwan.repository;

import com.kwan.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, UUID> {
    Optional<Operator> findByEmail(String email);
    List<Operator> findByCountry(String country);
    List<Operator> findByIsActiveTrue();
}
