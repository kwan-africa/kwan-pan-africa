package com.kwan.repository;

import com.kwan.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByPaystackReference(String reference);
    List<Booking> findByListingOperatorId(UUID operatorId);
    long countByListingOperatorIdAndStatus(UUID operatorId, Booking.BookingStatus status);
}
