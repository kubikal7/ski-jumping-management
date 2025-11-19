package com.example.ski_jumping_management.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RecommendationRequest {
    private Integer eventId;
    private Integer limit;
    private LocalDate fromDate;
}
