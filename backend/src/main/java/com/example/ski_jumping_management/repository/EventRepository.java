package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.Event;
import com.example.ski_jumping_management.model.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event,Integer> {
    List<Event> findByHillId(Integer hillId);
    boolean existsByHillId(Integer hillId);

    @Query("SELECT e FROM Event e WHERE e.hill.id = :hillId AND e.startDate > :date")
    Page<Event> findUpcomingEventsByHill(
            @Param("hillId") Integer hillId,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    @Query("SELECT e FROM Event e WHERE e.hill.id = :hillId AND e.endDate < :date")
    Page<Event> findPastEventsByHill(
            @Param("hillId") Integer hillId,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    @Query("""
        SELECT e FROM Event e
        JOIN EventParticipant ep ON ep.event = e
        WHERE ep.athlete.id = :athleteId
          AND e.startDate > :date
    """)
    Page<Event> findUpcomingEventsByAthlete(
            @Param("athleteId") Integer athleteId,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    @Query("""
        SELECT e FROM Event e
        JOIN EventParticipant ep ON ep.event = e
        WHERE ep.athlete.id = :athleteId
          AND e.endDate < :date
    """)
    Page<Event> findPastEventsByAthlete(
            @Param("athleteId") Integer athleteId,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    @Query("""
    SELECT e FROM Event e
    JOIN e.eventAllowedTeams t
    WHERE t.id = :teamId
      AND e.startDate > :date
    """)
    Page<Event> findUpcomingEventsByTeam(
            @Param("teamId") Integer teamId,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    @Query("""
    SELECT e FROM Event e
    JOIN e.eventAllowedTeams t
    WHERE t.id = :teamId
      AND e.endDate < :date
    """)
    Page<Event> findPastEventsByTeam(
            @Param("teamId") Integer teamId,
            @Param("date") LocalDate date,
            Pageable pageable
    );

    @Query("""
    SELECT DISTINCT e FROM Event e
    LEFT JOIN e.eventAllowedTeams t
    LEFT JOIN EventParticipant ep ON ep.event.id = e.id
    WHERE (:name IS NULL OR :name = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', :name, '%')))
      AND (:type IS NULL OR e.type = :type)
      AND (:hillId IS NULL OR e.hill.id = :hillId)
      AND (CAST(:startDateFrom AS DATE) IS NULL OR e.startDate >= :startDateFrom)
      AND (CAST(:startDateTo AS DATE) IS NULL OR e.startDate <= :startDateTo)
      AND (CAST(:endDateFrom AS DATE) IS NULL OR e.endDate >= :endDateFrom)
      AND (CAST(:endDateTo AS DATE) IS NULL OR e.endDate <= :endDateTo)
      AND (:description IS NULL OR :description = '' OR LOWER(e.description) LIKE LOWER(CONCAT('%', :description, '%')))
      AND (:level IS NULL OR e.level = :level)
      AND (:teamIds IS NULL OR t.id IN :teamIds)
      AND (:athleteIds IS NULL OR ep.athlete.id IN :athleteIds)
""")
    Page<Event> findFilteredEvents(
            @Param("name") String name,
            @Param("type") EventType type,
            @Param("hillId") Integer hillId,
            @Param("startDateFrom") LocalDateTime startDateFrom,
            @Param("startDateTo") LocalDateTime startDateTo,
            @Param("endDateFrom") LocalDateTime endDateFrom,
            @Param("endDateTo") LocalDateTime endDateTo,
            @Param("description") String description,
            @Param("level") Short level,
            @Param("teamIds") List<Integer> teamIds,
            @Param("athleteIds") List<Integer> athleteIds,
            Pageable pageable
    );

}
