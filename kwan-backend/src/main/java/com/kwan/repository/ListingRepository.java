package com.kwan.repository;

import com.kwan.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    @Query(value = """
        SELECT * FROM listings
        WHERE is_active = true
          AND (:country IS NULL OR country = :country)
          AND (:city IS NULL OR city ILIKE :city)
        ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
        LIMIT :topK
        """, nativeQuery = true)
    List<Listing> findSimilarListings(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("country") String country,
            @Param("city") String city,
            @Param("topK") int topK);

    List<Listing> findByOperatorIdAndIsActiveTrue(UUID operatorId);

    List<Listing> findByCountryAndIsActiveTrue(String country);

    List<Listing> findByCityIgnoreCaseAndIsActiveTrue(String city);

    Optional<Listing> findByInstagramHandle(String instagramHandle);

    Optional<Listing> findByExternalPlaceId(String externalPlaceId);

    long countByOperatorId(UUID operatorId);
}
