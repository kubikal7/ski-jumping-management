package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.DTO.ResultRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository resultRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventParticipantRepository eventParticipantRepository;
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
        String partitionName = "results_" + season.replace("/", "_");
        String sql = "DO $$ BEGIN " +
                "IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '" + partitionName + "') THEN " +
                "EXECUTE 'CREATE TABLE " + partitionName + " PARTITION OF results FOR VALUES IN (''" + season + "'');' ;" +
                "END IF; " +
                "END $$;";
        em.createNativeQuery(sql).executeUpdate();
    }

    public Page<Result> getFilteredResults(
            Integer eventId,
            List<Integer> athleteIds,
            List<String> seasons,
            Short attemptNumber,
            BigDecimal minJumpLength,
            BigDecimal maxJumpLength,
            BigDecimal minStylePoints,
            BigDecimal maxStylePoints,
            BigDecimal minWindCompensation,
            BigDecimal maxWindCompensation,
            Short minGate,
            Short maxGate,
            BigDecimal minTotalPoints,
            BigDecimal maxTotalPoints,
            BigDecimal minSpeedTakeoff,
            BigDecimal maxSpeedTakeoff,
            BigDecimal minFlightTime,
            BigDecimal maxFlightTime,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            String size
    ) {
        int pageSize;
        Pageable pageable;

        if ("unlimited".equalsIgnoreCase(size)) {
            pageable = Pageable.unpaged();
        } else {
            pageSize = Integer.parseInt(size);
            pageable = PageRequest.of(page, pageSize);
        }

        if ((athleteIds == null || athleteIds.isEmpty()) && eventId == null) {
            return Page.empty();
        }

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        return resultRepository.findFilteredResults(
                eventId,
                athleteIds,
                seasons,
                attemptNumber,
                minJumpLength,
                maxJumpLength,
                minStylePoints,
                maxStylePoints,
                minWindCompensation,
                maxWindCompensation,
                minGate,
                maxGate,
                minTotalPoints,
                maxTotalPoints,
                minSpeedTakeoff,
                maxSpeedTakeoff,
                minFlightTime,
                maxFlightTime,
                startDateTime,
                endDateTime,
                pageable
        );
    }


    public Result getResultById(Integer id) {
        return resultRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Result not found"));
    }

    @Transactional
    public Result createResult(ResultRequest request, CustomUserDetails currentUser) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        User athlete = userRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean athleteIsParticipant = eventParticipantRepository.existsByEventAndAthlete(event, athlete);
        if (!athleteIsParticipant) {
            throw new BadRequestException("Athlete is not registered for this event");
        }

        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (isTrainer && !isAdmin) {
            Set<Integer> trainerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> eventTeamIds = event.getEventAllowedTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = trainerTeamIds.stream().anyMatch(eventTeamIds::contains);
            if (!allowed) {
                throw new AccessDeniedException("Trainer cannot add result for event outside their teams");
            }
        }

        Result result = new Result();
        result.setEvent(event);
        result.setAthlete(athlete);
        result.setSeason(calculateSeason(event.getStartDate().toLocalDate()));
        result.setAttemptNumber(request.getAttemptNumber());
        result.setJumpLength(request.getJumpLength());
        result.setStylePoints(request.getStylePoints());
        result.setWindCompensation(request.getWindCompensation());
        result.setGate(request.getGate());
        result.setTotalPoints(request.getTotalPoints());
        result.setCoachComment(request.getCoachComment());
        result.setVideoUrl(request.getVideoUrl());
        result.setSpeedTakeoff(request.getSpeedTakeoff());
        result.setFlightTime(request.getFlightTime());

        ensurePartitionExists(result.getSeason());

        return resultRepository.save(result);
    }

    @Transactional
    public Result updateResult(Integer id, ResultRequest request, CustomUserDetails currentUser) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Result not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        User athlete = userRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean athleteIsParticipant = eventParticipantRepository.existsByEventAndAthlete(event, athlete);
        if (!athleteIsParticipant) {
            throw new BadRequestException("Athlete is not registered for this event");
        }

        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (isTrainer && !isAdmin) {
            Set<Integer> trainerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> eventTeamIds = event.getEventAllowedTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = trainerTeamIds.stream().anyMatch(eventTeamIds::contains);
            if (!allowed) {
                throw new AccessDeniedException("Trainer cannot edit result for event outside their teams");
            }
        }

        result.setEvent(event);
        result.setAthlete(athlete);
        result.setSeason(calculateSeason(event.getStartDate().toLocalDate()));
        result.setAttemptNumber(request.getAttemptNumber());
        result.setJumpLength(request.getJumpLength());
        result.setStylePoints(request.getStylePoints());
        result.setWindCompensation(request.getWindCompensation());
        result.setGate(request.getGate());
        result.setTotalPoints(request.getTotalPoints());
        result.setCoachComment(request.getCoachComment());
        result.setVideoUrl(request.getVideoUrl());
        result.setSpeedTakeoff(request.getSpeedTakeoff());
        result.setFlightTime(request.getFlightTime());

        ensurePartitionExists(result.getSeason());

        return resultRepository.save(result);
    }

    @Transactional
    public void deleteResult(Integer id, CustomUserDetails currentUser) {
        Result result = resultRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Result not found"));

        Event event = result.getEvent();

        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (isTrainer && !isAdmin) {
            Set<Integer> trainerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> eventTeamIds = event.getEventAllowedTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = trainerTeamIds.stream().anyMatch(eventTeamIds::contains);
            if (!allowed) {
                throw new AccessDeniedException("Trainer cannot delete result for event outside their teams");
            }
        }

        resultRepository.delete(result);
    }
}
