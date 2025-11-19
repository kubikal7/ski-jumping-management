package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Integer> {
    Optional<User> findByLogin(String login);

    boolean existsByLogin(String login);

    @Query("SELECT DISTINCT u FROM User u " +
            "JOIN u.teams t " +
            "JOIN u.roles r " +
            "WHERE t.id = :teamId AND r.name = 'ATHLETE' " +
            "ORDER BY u.lastName ASC")
    List<User> findAthletesByTeamIdOrderByLastNameAsc(@Param("teamId") Integer teamId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_teams WHERE team_id = :teamId", nativeQuery = true)
    void removeTeamFromUsers(Integer teamId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO user_teams (user_id, team_id) VALUES (:userId, :teamId)", nativeQuery = true)
    void addUserToTeam(@Param("userId") Integer userId, @Param("teamId") Integer teamId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_teams WHERE user_id = :userId AND team_id = :teamId", nativeQuery = true)
    void removeUserFromTeam(@Param("userId") Integer userId, @Param("teamId") Integer teamId);

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.teams t
        LEFT JOIN u.roles r
        WHERE (:teamIds IS NULL OR t.id IN :teamIds)
        AND (:roleIds IS NULL OR r.id IN :roleIds)
        AND (:active IS NULL OR u.active = :active)
        AND (:minHeight IS NULL OR u.height >= :minHeight)
        AND (:maxHeight IS NULL OR u.height <= :maxHeight)
        AND (:minWeight IS NULL OR u.weight >= :minWeight)
        AND (:maxWeight IS NULL OR u.weight <= :maxWeight)
        AND (CAST(:birthDateFrom AS date) IS NULL OR u.birthDate >= :birthDateFrom)
        AND (CAST(:birthDateTo AS date) IS NULL OR u.birthDate <= :birthDateTo)
        AND (
             :search IS NULL OR :search = '' 
             OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        """)
    Page<User> findUsers(
            @Param("active") Boolean active,
            @Param("minHeight") BigDecimal minHeight,
            @Param("maxHeight") BigDecimal maxHeight,
            @Param("minWeight") BigDecimal minWeight,
            @Param("maxWeight") BigDecimal maxWeight,
            @Param("birthDateFrom") LocalDate birthDateFrom,
            @Param("birthDateTo") LocalDate birthDateTo,
            @Param("teamIds") List<Integer> teamIds,
            @Param("roleIds") List<Integer> roleIds,
            @Param("search") String search,
            Pageable pageable
    );
}
