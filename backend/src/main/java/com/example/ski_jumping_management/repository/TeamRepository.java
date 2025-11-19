package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team,Integer> {
    Page<Team> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsByNameIgnoreCase(String name);

    @Query("""
    SELECT DISTINCT t FROM Team t
    WHERE (:teamIds IS NULL OR COALESCE(:teamIds) IS NULL OR t.id IN :teamIds)
    AND (:name IS NULL OR :name = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%')))
    """)
    Page<Team> findTeams(
            @Param("teamIds") List<Integer> teamIds,
            @Param("name") String name,
            Pageable pageable
    );
}
