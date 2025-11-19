package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.Hill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface HillRepository extends JpaRepository<Hill,Integer> {
    @Query("SELECT h FROM Hill h " +
            "WHERE (:name IS NULL OR :name = '' OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:city IS NULL OR :city = '' OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
            "AND (:country IS NULL OR :country = '' OR LOWER(h.country) LIKE LOWER(CONCAT('%', :country, '%'))) " +
            "AND (:minHillSize IS NULL OR h.hillSize >= :minHillSize) " +
            "AND (:maxHillSize IS NULL OR h.hillSize <= :maxHillSize) " +
            "AND (:minKPoint IS NULL OR h.constructionPoint >= :minKPoint) " +
            "AND (:maxKPoint IS NULL OR h.constructionPoint <= :maxKPoint) " +
            "AND (:latitude IS NULL OR h.latitude = :latitude) " +
            "AND (:longitude IS NULL OR h.longitude = :longitude)"
    )
    Page<Hill> findHills(
            @Param("name") String name,
            @Param("city") String city,
            @Param("country") String country,
            @Param("minHillSize") Short minHillSize,
            @Param("maxHillSize") Short maxHillSize,
            @Param("minKPoint") Short minKPoint,
            @Param("maxKPoint") Short maxKPoint,
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            Pageable pageable
    );
}
