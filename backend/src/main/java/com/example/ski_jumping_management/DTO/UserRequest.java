package com.example.ski_jumping_management.DTO;

import com.example.ski_jumping_management.model.Role;
import com.example.ski_jumping_management.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
public class UserRequest {
    private String firstName;
    private String lastName;
    private String login;
    private String password;
    private LocalDate birthDate;
    private String nationality;
    private Set<Integer> teamIds;
    private String photoUrl;
    private BigDecimal weight;
    private BigDecimal height;
    private Boolean active;
    private Set<Integer> roles = new HashSet<>();
}
