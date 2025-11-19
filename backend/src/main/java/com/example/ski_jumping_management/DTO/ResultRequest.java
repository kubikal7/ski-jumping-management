package com.example.ski_jumping_management.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ResultRequest {
    private Integer eventId;
    private Integer athleteId;
    private Short attemptNumber;
    private BigDecimal jumpLength;
    private BigDecimal stylePoints;
    private BigDecimal windCompensation;
    private Short gate;
    private BigDecimal totalPoints;
    private String coachComment;
    private String videoUrl;
    private BigDecimal speedTakeoff;
    private BigDecimal flightTime;
}
