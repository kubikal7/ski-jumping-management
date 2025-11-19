package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.DTO.EventParticipantRequest;
import com.example.ski_jumping_management.DTO.RecommendationRequest;
import com.example.ski_jumping_management.model.EventParticipant;
import com.example.ski_jumping_management.model.User;
import com.example.ski_jumping_management.security.CustomUserDetails;
import com.example.ski_jumping_management.service.EventParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/event-participants")
@RequiredArgsConstructor
public class EventParticipantController {

    private final EventParticipantService eventParticipantService;

    @GetMapping("/by-event/{eventId}")
    public List<EventParticipant> getParticipantsByEventId(@PathVariable Integer eventId) {
        return eventParticipantService.getParticipantsByEventId(eventId);
    }

    @GetMapping("/by-athlete/{athleteId}")
    public List<EventParticipant> getParticipantsByAthleteId(@PathVariable Integer athleteId) {
        return eventParticipantService.getParticipantsByAthleteId(athleteId);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public EventParticipant createParticipant(@RequestBody EventParticipantRequest request, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return eventParticipantService.createParticipant(request, currentUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public void deleteParticipant(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        eventParticipantService.deleteParticipant(id, currentUser);
    }

    @PostMapping("/recommend")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public List<User> recommendAthletes(@RequestBody RecommendationRequest request) {
        return eventParticipantService.recommendAthletes(request);
    }
}

