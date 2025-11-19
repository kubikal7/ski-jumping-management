package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.Injury;
import com.example.ski_jumping_management.model.SeverityLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface InjuryRepository extends JpaRepository<Injury, Integer> {
    @Query("SELECT DISTINCT i FROM Injury i " +
            "JOIN i.athlete a " +
            "LEFT JOIN a.teams t " +
            "WHERE (:athleteIds IS NULL OR a.id IN :athleteIds) " +
            "AND (:severity IS NULL OR i.severity = :severity) " +
            "AND (CAST(:injuryFrom AS DATE) IS NULL OR i.injuryDate >= :injuryFrom) " +
            "AND (CAST(:injuryTo AS DATE) IS NULL OR i.injuryDate <= :injuryTo) " +
            "AND (CAST(:recoveryFrom AS DATE) IS NULL OR i.recoveryDate >= :recoveryFrom) " +
            "AND (CAST(:recoveryTo AS DATE) IS NULL OR i.recoveryDate <= :recoveryTo) " +
            "AND (:teamIds IS NULL OR t.id IN :teamIds) " +
            "AND (CAST(:eventStart AS DATE) IS NULL OR i.recoveryDate IS NULL OR i.recoveryDate >= :eventStart) " +
            "AND (CAST(:eventEnd AS DATE) IS NULL OR i.injuryDate <= :eventEnd)")
    Page<Injury> findFilteredInjuries(
            @Param("athleteIds") List<Integer> athleteIds,
            @Param("severity") SeverityLevel severity,
            @Param("injuryFrom") LocalDate injuryFrom,
            @Param("injuryTo") LocalDate injuryTo,
            @Param("recoveryFrom") LocalDate recoveryFrom,
            @Param("recoveryTo") LocalDate recoveryTo,
            @Param("teamIds") List<Integer> teamIds,
            @Param("eventStart") LocalDate eventStart,
            @Param("eventEnd") LocalDate eventEnd,
            Pageable pageable
    );



}
