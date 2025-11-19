package com.example.ski_jumping_management.security;

import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.model.User;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final String SECRET_KEY = "Y2xvdGhpbmd6dWx1d2hlcmVyZW1lbWJlcnN1cHBseW9yaWdpbnRoZXNlcmVtYWludGk=";
    private final SecretKey key = new SecretKeySpec(SECRET_KEY.getBytes(), "HmacSHA256");

    public String generateToken(User user) {

        List<Integer> teamIds = user.getTeams().stream()
                .map(Team::getId)
                .collect(Collectors.toList());


        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getLogin())
                .claim("userId", user.getId())
                .claim("roles", roles)
                .claim("teamIds", teamIds)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public List<String> extractRoles(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("roles", List.class);
    }

}
