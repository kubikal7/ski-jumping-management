package com.example.ski_jumping_management.DTO;

import com.example.ski_jumping_management.model.EventType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class EventRequest {
    private String name;
    private EventType type;
    private Integer hillId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String description;
    private Short level;
    private Set<Integer> allowedTeamIds = new HashSet<>();
}
