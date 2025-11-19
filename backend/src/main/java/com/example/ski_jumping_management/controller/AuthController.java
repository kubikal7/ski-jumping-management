package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.DTO.LoginRequest;
import com.example.ski_jumping_management.DTO.LoginResponse;
import com.example.ski_jumping_management.model.User;
import com.example.ski_jumping_management.repository.UserRepository;
import com.example.ski_jumping_management.security.JwtService;
import com.example.ski_jumping_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserService userService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword()));

        Optional<User> user = userRepository.findByLogin(request.getLogin());

        String token = jwtService.generateToken(user.get());

        userService.updateLastLogin(user.get().getId(), LocalDateTime.now());
        return new LoginResponse(token, user.get().getMustChangePassword());
    }
}