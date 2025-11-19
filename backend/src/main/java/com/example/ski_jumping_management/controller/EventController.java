package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.DTO.EventRequest;
import com.example.ski_jumping_management.model.Event;
import com.example.ski_jumping_management.model.EventType;
import com.example.ski_jumping_management.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("")
    public Page<Event> getFilteredEvents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) Integer hillId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateTo,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Short level,
            @RequestParam(required = false) List<Integer> teamIds,
            @RequestParam(required = false) List<Integer> athleteIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        return eventService.getEvents(
                name, type, hillId, startDateFrom, startDateTo,
                endDateFrom, endDateTo, description, level, teamIds, athleteIds,page, size, sortBy, sortDirection
        );
    }

    @GetMapping("/hill/{id}/has-events")
    public boolean hillHasEvents(@PathVariable Integer id) {
        return eventService.existsByHillId(id);
    }

    @GetMapping("/athlete/{athleteId}/upcoming")
    public Page<Event> getUpcomingEventsForAthlete(
            @PathVariable Integer athleteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        LocalDate today = LocalDate.now();
        return eventService.getEvents(null, null, null,
                today, null, null, null,
                null, null, null, List.of(athleteId),
                page, size, sortBy, sortDirection
        );
    }

    @GetMapping("/athlete/{athleteId}/past")
    public Page<Event> getPastEventsForAthlete(
            @PathVariable Integer athleteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        LocalDate today = LocalDate.now();
        return eventService.getEvents(null, null, null, null,
                today, null, null, null,
                null, null, List.of(athleteId), page,
                size, sortBy, sortDirection
        );
    }

    @GetMapping("/hill/{hillId}/upcoming")
    public Page<Event> getUpcomingEventsForHill(
            @PathVariable Integer hillId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        LocalDate today = LocalDate.now();
        return eventService.getEvents(null, null, hillId, today,
                null, null, null, null,
                null, null, null, page,
                size, sortBy, sortDirection
        );
    }

    @GetMapping("/hill/{hillId}/past")
    public Page<Event> getPastEventsForHill(
            @PathVariable Integer hillId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        LocalDate today = LocalDate.now();
        return eventService.getEvents(null, null, hillId, null,
                today, null, null, null,
                null, null, null, page, size, sortBy, sortDirection
        );
    }

    @GetMapping("/team/{teamId}/upcoming")
    public Page<Event> getUpcomingEventsForTeam(
            @PathVariable Integer teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        LocalDate today = LocalDate.now();
        return eventService.getEvents(null, null, null, today,
                null, null, null, null,
                null, List.of(teamId), null, page,
                size, sortBy, sortDirection
        );
    }

    @GetMapping("/team/{teamId}/past")
    public Page<Event> getPastEventsForTeam(
            @PathVariable Integer teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        LocalDate today = LocalDate.now();
        return eventService.getEvents(null, null, null, null,
                today, null, null, null, null, List.of(teamId),
                null, page, size, sortBy, sortDirection
        );
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Integer id) {
        return eventService.getEventById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATE')")
    public Event createEvent(@RequestBody EventRequest event) {
        System.out.println(event);
        return eventService.createEvent(event);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATE')")
    public Event updateEvent(@PathVariable Integer id, @RequestBody EventRequest eventDetails) {
        return eventService.updateEvent(id, eventDetails);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATE')")
    public void deleteEvent(@PathVariable Integer id) {
        eventService.deleteEvent(id);
    }
}
