package com.example.ski_jumping_management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "athlete_id")
    private User athlete;

    @Column(name = "season", nullable = false, length = 9)
    private String season;

    @Column(name = "attempt_number")
    private Short attemptNumber;

    @Column(name = "jump_length", precision = 4, scale = 1)
    private BigDecimal jumpLength;

    @Column(name = "style_points", precision = 3, scale = 1)
    private BigDecimal stylePoints;

    @Column(name = "wind_compensation", precision = 3, scale = 1)
    private BigDecimal windCompensation;

    @Column(name = "gate")
    private Short gate;

    @Column(name = "total_points", precision = 5, scale = 1)
    private BigDecimal totalPoints;

    @Column(name = "coach_comment")
    private String coachComment;

    @Column(name = "video_url", length = 255)
    private String videoUrl;

    @Column(name = "speed_takeoff", precision = 4, scale = 1)
    private BigDecimal speedTakeoff;

    @Column(name = "flight_time", precision = 3, scale = 1)
    private BigDecimal flightTime;
}
