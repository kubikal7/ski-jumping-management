package com.example.ski_jumping_management.model;

import com.example.ski_jumping_management.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "injuries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Injury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "athlete_id", nullable = false)
    private User athlete;

    @Column(name = "injury_date")
    private LocalDate injuryDate;

    @Column(name = "recovery_date")
    private LocalDate recoveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity")
    private SeverityLevel severity;

    @Column(name = "description")
    private String description;
}
