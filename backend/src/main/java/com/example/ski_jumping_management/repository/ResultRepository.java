package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.EventParticipant;
import com.example.ski_jumping_management.model.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Integer> {
    @Query("SELECT r FROM Result r WHERE " +
            "(:eventId IS NULL OR r.event.id = :eventId) AND " +
            "(:athleteIds IS NULL OR r.athlete.id IN :athleteIds) AND " +
            "(:seasons IS NULL OR r.season IN :seasons) AND " +
            "(:attemptNumber IS NULL OR r.attemptNumber = :attemptNumber) AND " +
            "(:minJumpLength IS NULL OR r.jumpLength >= :minJumpLength) AND " +
            "(:maxJumpLength IS NULL OR r.jumpLength <= :maxJumpLength) AND " +
            "(:minStylePoints IS NULL OR r.stylePoints >= :minStylePoints) AND " +
            "(:maxStylePoints IS NULL OR r.stylePoints <= :maxStylePoints) AND " +
            "(:minWindCompensation IS NULL OR r.windCompensation >= :minWindCompensation) AND " +
            "(:maxWindCompensation IS NULL OR r.windCompensation <= :maxWindCompensation) AND " +
            "(:minGate IS NULL OR r.gate >= :minGate) AND " +
            "(:maxGate IS NULL OR r.gate <= :maxGate) AND " +
            "(:minTotalPoints IS NULL OR r.totalPoints >= :minTotalPoints) AND " +
            "(:maxTotalPoints IS NULL OR r.totalPoints <= :maxTotalPoints) AND " +
            "(:minSpeedTakeoff IS NULL OR r.speedTakeoff >= :minSpeedTakeoff) AND " +
            "(:maxSpeedTakeoff IS NULL OR r.speedTakeoff <= :maxSpeedTakeoff) AND " +
            "(:minFlightTime IS NULL OR r.flightTime >= :minFlightTime) AND " +
            "(:maxFlightTime IS NULL OR r.flightTime <= :maxFlightTime) AND " +
            "(CAST(:startDate AS DATE) IS NULL OR r.event.startDate >= :startDate) AND " +
            "(CAST(:endDate AS DATE) IS NULL OR r.event.startDate <= :endDate)")
    Page<Result> findFilteredResults(
            @Param("eventId") Integer eventId,
            @Param("athleteIds") List<Integer> athleteIds,
            @Param("seasons") List<String> seasons,
            @Param("attemptNumber") Short attemptNumber,
            @Param("minJumpLength") BigDecimal minJumpLength,
            @Param("maxJumpLength") BigDecimal maxJumpLength,
            @Param("minStylePoints") BigDecimal minStylePoints,
            @Param("maxStylePoints") BigDecimal maxStylePoints,
            @Param("minWindCompensation") BigDecimal minWindCompensation,
            @Param("maxWindCompensation") BigDecimal maxWindCompensation,
            @Param("minGate") Short minGate,
            @Param("maxGate") Short maxGate,
            @Param("minTotalPoints") BigDecimal minTotalPoints,
            @Param("maxTotalPoints") BigDecimal maxTotalPoints,
            @Param("minSpeedTakeoff") BigDecimal minSpeedTakeoff,
            @Param("maxSpeedTakeoff") BigDecimal maxSpeedTakeoff,
            @Param("minFlightTime") BigDecimal minFlightTime,
            @Param("maxFlightTime") BigDecimal maxFlightTime,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

}
