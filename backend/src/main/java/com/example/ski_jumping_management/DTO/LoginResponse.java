package com.example.ski_jumping_management.DTO;

import lombok.*;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private boolean mustChangePassword;
}
