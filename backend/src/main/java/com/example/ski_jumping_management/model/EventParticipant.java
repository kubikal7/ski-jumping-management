package com.example.ski_jumping_management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "event_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "athlete_id", nullable = false)
    private User athlete;

    @Column(length = 9, nullable = false)
    private String season;
}
