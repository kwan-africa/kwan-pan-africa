package com.kwan.repository;

import com.kwan.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {
    List<Itinerary> findByTouristEmailOrderByCreatedAtDesc(String email);
    List<Itinerary> findByDestinationOrderByCreatedAtDesc(String destination);
}
