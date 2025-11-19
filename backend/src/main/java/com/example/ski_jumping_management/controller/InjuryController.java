package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.DTO.InjuryRequest;
import com.example.ski_jumping_management.model.Injury;
import com.example.ski_jumping_management.model.SeverityLevel;
import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.security.CustomUserDetails;
import com.example.ski_jumping_management.service.InjuryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/injuries")
@RequiredArgsConstructor
public class InjuryController {

    private final InjuryService injuryService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INJURY_MANAGER')")
    public Injury getInjuryById(@PathVariable Integer id) {
        return injuryService.getInjuryById(id);
    }

    @GetMapping("")
    public Page<Injury> getFilteredInjuries(
            @RequestParam(required = false) List<Integer> athleteIds,
            @RequestParam(required = false) List<Integer> teamIds,
            @RequestParam(required = false) SeverityLevel severity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate injuryFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate injuryTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recoveryFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recoveryTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate eventStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate eventEnd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "injuryDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        return injuryService.getInjuries(
                athleteIds,
                teamIds,
                severity,
                injuryFrom,
                injuryTo,
                recoveryFrom,
                recoveryTo,
                eventStart,
                eventEnd,
                page,
                size,
                sortBy,
                sortDirection
        );
    }


    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INJURY_MANAGER')")
    public Injury createInjury(@RequestBody InjuryRequest injury, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return injuryService.createInjury(injury, currentUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INJURY_MANAGER')")
    public Injury updateInjury(@PathVariable Integer id, @RequestBody InjuryRequest injury, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return injuryService.updateInjury(id, injury, currentUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INJURY_MANAGER')")
    public void deleteInjury(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        injuryService.deleteInjury(id, currentUser);
    }
}

