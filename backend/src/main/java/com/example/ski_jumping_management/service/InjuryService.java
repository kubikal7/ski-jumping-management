package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.DTO.InjuryRequest;
import com.example.ski_jumping_management.exceptions.BadRequestException;
import com.example.ski_jumping_management.model.*;
import com.example.ski_jumping_management.repository.InjuryRepository;
import com.example.ski_jumping_management.repository.UserRepository;
import com.example.ski_jumping_management.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InjuryService {

    private final InjuryRepository injuryRepository;
    private final UserRepository userRepository;

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

    public Injury getInjuryById(Integer id) {
        return injuryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Injury not found"));
    }

    public Page<Injury> getInjuries(
            List<Integer> athleteIds,
            List<Integer> teamIds,
            SeverityLevel severity,
            LocalDate injuryFrom,
            LocalDate injuryTo,
            LocalDate recoveryFrom,
            LocalDate recoveryTo,
            LocalDate eventStart,
            LocalDate eventEnd,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return injuryRepository.findFilteredInjuries(
                athleteIds,
                severity,
                injuryFrom,
                injuryTo,
                recoveryFrom,
                recoveryTo,
                teamIds,
                eventStart,
                eventEnd,
                pageable
        );
    }


    public Injury createInjury(InjuryRequest request, CustomUserDetails currentUser) {

        User athlete = userRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new EntityNotFoundException("Athlete not found"));

        boolean isAthlete = athlete.getRoles().stream().anyMatch(role -> role.getName().name().equals("ATHLETE"));
        if (!isAthlete) {
            throw new BadRequestException("User must have role ATHLETE to create an injury");
        }

        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isInjuryManager = hasAnyRole(currentUser, UserRole.INJURY_MANAGER);

        if (isInjuryManager && !isAdmin) {
            Set<Integer> managerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> athleteTeamIds = athlete.getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = athleteTeamIds.stream().anyMatch(managerTeamIds::contains);

            if (!allowed) {
                throw new AccessDeniedException("You cannot create injuries for athletes outside your teams");
            }
        }

        Injury injury = new Injury();
        injury.setAthlete(athlete);
        injury.setInjuryDate(request.getInjuryDate());
        injury.setRecoveryDate(request.getRecoveryDate());
        injury.setSeverity(request.getSeverity());
        injury.setDescription(request.getDescription());

        return injuryRepository.save(injury);
    }

    public Injury updateInjury(Integer id, InjuryRequest request, CustomUserDetails currentUser) {
        Injury injury = injuryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Injury not found"));

        User athlete = userRepository.findById(request.getAthleteId()).orElseThrow(() -> new EntityNotFoundException("Athlete not found"));

        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isInjuryManager = hasAnyRole(currentUser, UserRole.INJURY_MANAGER);

        if (isInjuryManager && !isAdmin) {
            Set<Integer> managerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> athleteTeamIds = athlete.getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = athleteTeamIds.stream().anyMatch(managerTeamIds::contains);

            if (!allowed) {
                throw new AccessDeniedException("You cannot update injuries for athletes outside your teams");
            }
        }

        injury.setAthlete(athlete);
        injury.setInjuryDate(request.getInjuryDate());
        injury.setRecoveryDate(request.getRecoveryDate());
        injury.setSeverity(request.getSeverity());
        injury.setDescription(request.getDescription());

        return injuryRepository.save(injury);
    }

    public void deleteInjury(Integer id, CustomUserDetails currentUser) {
        Injury injury = injuryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Injury not found"));

        User athlete = injury.getAthlete();

        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isInjuryManager = hasAnyRole(currentUser, UserRole.INJURY_MANAGER);

        if (isInjuryManager && !isAdmin) {
            Set<Integer> managerTeamIds = currentUser.getUser().getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            Set<Integer> athleteTeamIds = athlete.getTeams().stream().map(Team::getId).collect(Collectors.toSet());

            boolean allowed = athleteTeamIds.stream().anyMatch(managerTeamIds::contains);

            if (!allowed) {
                throw new AccessDeniedException("You cannot delete injuries for athletes outside your teams");
            }
        }

        injuryRepository.delete(injury);
    }
}
