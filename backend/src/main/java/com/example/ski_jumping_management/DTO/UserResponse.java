package com.example.ski_jumping_management.DTO;

import com.example.ski_jumping_management.model.Role;
import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.model.User;
import com.example.ski_jumping_management.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Integer id;
    private String firstName;
    private String lastName;
    private String login;
    private Set<Role> roles;
    private Set<Team> teams;
    private LocalDate birthDate;
    private String nationality;
    private String photoUrl;
    private BigDecimal weight;
    private BigDecimal height;
    private Boolean active;
    private LocalDateTime lastLogin;

    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getLogin(),
                user.getRoles(),
                user.getTeams(),
                user.getBirthDate(),
                user.getNationality(),
                user.getPhotoUrl(),
                user.getWeight(),
                user.getHeight(),
                user.getActive(),
                user.getLastLogin()
        );
    }
}

