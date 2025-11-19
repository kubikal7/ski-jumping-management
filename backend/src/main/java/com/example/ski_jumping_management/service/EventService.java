package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.DTO.EventRequest;
import com.example.ski_jumping_management.exceptions.BadRequestException;
import com.example.ski_jumping_management.model.Event;
import com.example.ski_jumping_management.model.EventType;
import com.example.ski_jumping_management.model.Hill;
import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.repository.EventRepository;
import com.example.ski_jumping_management.repository.HillRepository;
import com.example.ski_jumping_management.repository.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final HillRepository hillRepository;
    private final TeamRepository teamRepository;

    private Set<Team> getAllowedTeamsFromIds(Set<Integer> teamIds) {
        return teamIds.stream()
                .map(teamId -> teamRepository.findById(teamId)
                        .orElseThrow(() -> new BadRequestException("Team not found: " + teamId)))
                .collect(Collectors.toSet());
    }

    public Page<Event> getEvents(
            String name,
            EventType type,
            Integer hillId,
            LocalDate startDateFrom,
            LocalDate startDateTo,
            LocalDate endDateFrom,
            LocalDate endDateTo,
            String description,
            Short level,
            List<Integer> teamIds,
            List<Integer> athleteIds,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort sort = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        LocalDateTime startDateFromDateTime = startDateFrom != null ? startDateFrom.atStartOfDay() : null;
        LocalDateTime startDateToDateTime = startDateTo != null ? startDateTo.atTime(23, 59, 59) : null;

        LocalDateTime endDateFromDateTime = endDateFrom != null ? endDateFrom.atStartOfDay() : null;
        LocalDateTime endDateToDateTime = endDateTo != null ? endDateTo.atTime(23, 59, 59) : null;

        return eventRepository.findFilteredEvents(
                name, type, hillId, startDateFromDateTime, startDateToDateTime,
                endDateFromDateTime, endDateToDateTime, description, level,
                teamIds, athleteIds, pageable
        );
    }

    public boolean existsByHillId(Integer id){
        return eventRepository.existsByHillId(id);
    }

    public Event getEventById(Integer id) {
        return eventRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
    }

    public Page<Event> getUpcomingEventsForAthlete(Integer athleteId, LocalDate fromDate, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return eventRepository.findUpcomingEventsByAthlete(athleteId, fromDate, pageable);
    }

    public Page<Event> getPastEventsForAthlete(Integer athleteId, LocalDate toDate, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return eventRepository.findPastEventsByAthlete(athleteId, toDate, pageable);
    }

    public Page<Event> getUpcomingEventsForHill(Integer hillId, LocalDate fromDate, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        System.out.println("Fetching upcoming events for hillId: " + hillId + " from date: " + fromDate);
        return eventRepository.findUpcomingEventsByHill(hillId, fromDate, pageable);
    }

    public Page<Event> getPastEventsForHill(Integer hillId, LocalDate toDate, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return eventRepository.findPastEventsByHill(hillId, toDate, pageable);
    }

    public Page<Event> getUpcomingEventsForTeam(Integer teamId, LocalDate fromDate, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return eventRepository.findUpcomingEventsByTeam(teamId, fromDate, pageable);
    }

    public Page<Event> getPastEventsForTeam(Integer teamId, LocalDate toDate, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return eventRepository.findPastEventsByTeam(teamId, toDate, pageable);
    }

    public Event createEvent(EventRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Event name cannot be null or empty");
        }

        if (request.getHillId() == null) {
            throw new BadRequestException("Hill ID cannot be null");
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new BadRequestException("Start and end dates are required");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        if (request.getLevel() == null || request.getLevel() < 1 || request.getLevel() > 5) {
            throw new BadRequestException("Level must be between 1 and 5");
        }

        Hill hill = hillRepository.findById(request.getHillId())
                .orElseThrow(() -> new BadRequestException("Hill not found"));

        Event event = new Event();
        event.setName(request.getName().trim());
        event.setType(request.getType());
        event.setHill(hill);
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setDescription(request.getDescription());
        event.setLevel(request.getLevel());

        event.setEventAllowedTeams(getAllowedTeamsFromIds(request.getAllowedTeamIds()));

        return eventRepository.save(event);
    }

    public Event updateEvent(Integer id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        Hill hill = hillRepository.findById(request.getHillId())
                .orElseThrow(() -> new EntityNotFoundException("Hill not found"));

        event.setName(request.getName());
        event.setType(request.getType());
        event.setHill(hill);
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setDescription(request.getDescription());
        event.setLevel(request.getLevel());
        event.setEventAllowedTeams(getAllowedTeamsFromIds(request.getAllowedTeamIds()));

        return eventRepository.save(event);
    }

    public void deleteEvent(Integer id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        eventRepository.delete(event);
    }
}
