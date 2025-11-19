package com.example.ski_jumping_management.DTO;

import com.example.ski_jumping_management.model.SeverityLevel;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InjuryRequest {
    private Integer athleteId;
    private LocalDate injuryDate;
    private LocalDate recoveryDate;
    private SeverityLevel severity;
    private String description;
}
