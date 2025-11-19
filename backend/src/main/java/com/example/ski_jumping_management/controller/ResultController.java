package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.DTO.ResultRequest;
import com.example.ski_jumping_management.model.Result;
import com.example.ski_jumping_management.security.CustomUserDetails;
import com.example.ski_jumping_management.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @GetMapping("")
    public Page<Result> getFilteredResults(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) List<Integer> athleteIds,
            @RequestParam(required = false) List<String> seasons,
            @RequestParam(required = false) Short attemptNumber,
            @RequestParam(required = false) BigDecimal minJumpLength,
            @RequestParam(required = false) BigDecimal maxJumpLength,
            @RequestParam(required = false) BigDecimal minStylePoints,
            @RequestParam(required = false) BigDecimal maxStylePoints,
            @RequestParam(required = false) BigDecimal minWindCompensation,
            @RequestParam(required = false) BigDecimal maxWindCompensation,
            @RequestParam(required = false) Short minGate,
            @RequestParam(required = false) Short maxGate,
            @RequestParam(required = false) BigDecimal minTotalPoints,
            @RequestParam(required = false) BigDecimal maxTotalPoints,
            @RequestParam(required = false) BigDecimal minSpeedTakeoff,
            @RequestParam(required = false) BigDecimal maxSpeedTakeoff,
            @RequestParam(required = false) BigDecimal minFlightTime,
            @RequestParam(required = false) BigDecimal maxFlightTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "unlimited") String size
    ) {
        return resultService.getFilteredResults(
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
                startDate,
                endDate,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public Result getResultById(@PathVariable Integer id) {
        return resultService.getResultById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public Result createResult(@RequestBody ResultRequest request, @AuthenticationPrincipal CustomUserDetails currentUser) {
        System.out.println(request);
        return resultService.createResult(request, currentUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public Result updateResult(@PathVariable Integer id, @RequestBody ResultRequest request, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return resultService.updateResult(id, request, currentUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public void deleteResult(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        resultService.deleteResult(id, currentUser);
    }
}
