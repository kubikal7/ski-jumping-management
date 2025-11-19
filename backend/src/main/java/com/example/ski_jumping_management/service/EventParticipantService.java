package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.DTO.EventParticipantRequest;
import com.example.ski_jumping_management.DTO.RecommendationRequest;
import com.example.ski_jumping_management.exceptions.BadRequestException;
import com.example.ski_jumping_management.model.*;
import com.example.ski_jumping_management.repository.EventParticipantRepository;
import com.example.ski_jumping_management.repository.EventRepository;
import com.example.ski_jumping_management.repository.ResultRepository;
import com.example.ski_jumping_management.repository.UserRepository;
import com.example.ski_jumping_management.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventParticipantService {

    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ResultRepository resultRepository;
    private final EventService eventService;
    private final EntityManager em;

    public boolean hasAnyRole(CustomUserDetails userDetails, UserRole... roles) {
        if (userDetails == null || userDetails.getAuthorities() == null) return false;

        return userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .anyMatch(roleName -> {
                    for (UserRole r : roles) {
                        if (roleName.equals(r.name())) return true;
                    }
                    return false;
                });
    }

    private double calculateAthleteScore(List<Result> results, int eventHillSize,
                                         LocalDate referenceDate, LocalDate oldestAllowedDate) {
        if (results.isEmpty()) return 0.0;

        double totalScore = 0.0;

        for (Result r : results) {
            double jumpRatio = r.getJumpLength().doubleValue() / r.getEvent().getHill().getHillSize().doubleValue();
            double hillFactor = 1 - Math.abs(r.getEvent().getHill().getHillSize().doubleValue() - eventHillSize) / (double) eventHillSize;

            long daysOld = ChronoUnit.DAYS.between(r.getEvent().getStartDate().toLocalDate(), referenceDate);
            long totalWindow = ChronoUnit.DAYS.between(oldestAllowedDate, referenceDate);
            double recencyFactor = totalWindow > 0 ? Math.max(0, (double)(totalWindow - daysOld) / totalWindow) : 1.0;

            totalScore += jumpRatio * hillFactor * recencyFactor * r.getEvent().getLevel();
        }

        return totalScore / results.size();
    }

    private String calculateSeason(LocalDate startDate) {
        int year1 = startDate.getYear();
        int month = startDate.getMonthValue();
        int year2;
        if (month >= 5) {
            year2 = year1 + 1;
        } else {
            year2 = year1;
            year1 = year1 - 1;
        }
        return year1 + "/" + year2;
    }

    @Transactional
    public void ensurePartitionExists(String season) {
        String partitionName = "event_participants_" + season.replace("/", "_");
        String sql = "DO $$ BEGIN " +
                "IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '" + partitionName + "') THEN " +
                "EXECUTE 'CREATE TABLE " + partitionName + " PARTITION OF event_participants FOR VALUES IN (''" + season + "'');' ;" +
                "END IF; " +
                "END $$;";
        em.createNativeQuery(sql).executeUpdate();
    }


    public List<EventParticipant> getParticipantsByEventId(Integer eventId) {
        eventRepository.findById(eventId).orElseThrow(() -> new EntityNotFoundException("Event not found"));

        return participantRepository.findByEventId(eventId);
    }

    public List<EventParticipant> getParticipantsByAthleteId(Integer athleteId) {
        userRepository.findById(athleteId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        return participantRepository.findByAthleteId(athleteId);
    }

    @Transactional
    public EventParticipant createParticipant(EventParticipantRequest request, CustomUserDetails currentUser) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);

        if (isTrainer && !isAdmin) {
            Set<Integer> trainerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> eventTeamIds = event.getEventAllowedTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = trainerTeamIds.stream().anyMatch(eventTeamIds::contains);

            if (!allowed) {
                throw new AccessDeniedException("Trainer's team not allowed for this event");
            }
        }

        User athlete = userRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isAthlete = athlete.getRoles().stream().anyMatch(role -> role.getName().name().equals("ATHLETE"));

        if (!isAthlete) {
            throw new BadRequestException("User must have role ATHLETE to be added as participant");
        }

        boolean alreadyParticipant = participantRepository.existsByEventAndAthlete(event, athlete);
        if (alreadyParticipant) {
            throw new BadRequestException("User is already registered for this event");
        }

        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setAthlete(athlete);
        participant.setSeason(calculateSeason(event.getStartDate().toLocalDate()));

        ensurePartitionExists(participant.getSeason());

        return participantRepository.save(participant);
    }

    public void deleteParticipant(Integer id, CustomUserDetails currentUser) {
        EventParticipant participant = participantRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("EventParticipant not found"));

        Event event = participant.getEvent();
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);

        if (isTrainer && !isAdmin) {
            Set<Integer> trainerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> eventTeamIds = event.getEventAllowedTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = trainerTeamIds.stream().anyMatch(eventTeamIds::contains);
            if (!allowed) {
                throw new AccessDeniedException("Trainer's team not allowed to delete this participant");
            }
        }

        participantRepository.delete(participant);
    }

    public List<User> recommendAthletes(RecommendationRequest request) {

        if (request.getLimit() == null || request.getLimit() <= 0) {
            throw new BadRequestException("Limit must be provided and greater than 0");
        }

        if (request.getFromDate() == null) {
            throw new BadRequestException("fromDate must be provided");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        int eventHillSize = event.getHill().getHillSize().intValue();

        LocalDateTime eventEnd = event.getEndDate();
        LocalDateTime now = LocalDateTime.now();

        if (eventEnd.isBefore(now)) {
            throw new BadRequestException("Cannot recommend athletes for a past event");
        }

        LocalDateTime endDateForFiltering = eventEnd.isAfter(now) ? now : eventEnd;
        LocalDateTime oldestAllowedDateTime = request.getFromDate().atStartOfDay();

        Page<Result> resultPage = resultRepository.findFilteredResults(
                null,
                null,
                null,
                null,
                null, null,
                null, null,
                null, null,
                null, null,
                null, null,
                null, null,
                null, null,
                oldestAllowedDateTime,
                endDateForFiltering,
                Pageable.unpaged()
        );

        List<Result> recentResults = resultPage.getContent();

        Map<User, List<Result>> resultsByAthlete = recentResults.stream()
                .collect(Collectors.groupingBy(Result::getAthlete));

        Map<User, Double> scoreMap = new HashMap<>();

        for (Map.Entry<User, List<Result>> entry : resultsByAthlete.entrySet()) {
            User athlete = entry.getKey();
            List<Result> results = entry.getValue();

            double athleteScore = calculateAthleteScore(
                    results,
                    eventHillSize,
                    endDateForFiltering.toLocalDate(),
                    oldestAllowedDateTime.toLocalDate()
            );

            scoreMap.put(athlete, athleteScore);
        }

        return scoreMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(request.getLimit())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }




}



