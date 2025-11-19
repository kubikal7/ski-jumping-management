package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.Event;
import com.example.ski_jumping_management.model.EventParticipant;
import com.example.ski_jumping_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventParticipantRepository extends JpaRepository<EventParticipant,Integer> {
    List<EventParticipant> findByEventId(Integer eventId);
    List<EventParticipant> findByAthleteId(Integer athleteId);
    boolean existsByEventAndAthlete(Event event, User athlete);
}
