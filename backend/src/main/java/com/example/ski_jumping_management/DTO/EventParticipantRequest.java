package com.example.ski_jumping_management.DTO;

import lombok.Data;

@Data
public class EventParticipantRequest {
    private Integer eventId;
    private Integer athleteId;
}
