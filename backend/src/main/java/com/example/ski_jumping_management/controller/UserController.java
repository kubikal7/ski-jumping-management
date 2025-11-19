package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.DTO.UserRequest;
import com.example.ski_jumping_management.DTO.UserResponse;
import com.example.ski_jumping_management.security.CustomUserDetails;
import com.example.ski_jumping_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    @GetMapping("")
    public Page<UserResponse> getUsers(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) BigDecimal minHeight,
            @RequestParam(required = false) BigDecimal maxHeight,
            @RequestParam(required = false) BigDecimal minWeight,
            @RequestParam(required = false) BigDecimal maxWeight,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDateTo,
            @RequestParam(required = false) List<Integer> teamIds,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<Integer> roleIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        return userService.getUsers(
                active, minHeight, maxHeight, minWeight, maxWeight,
                birthDateFrom, birthDateTo, teamIds, search, roleIds, page, size, sortBy, sortDirection
        );
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return userService.getUserById(currentUser.getUser().getId());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public UserResponse createUser(@RequestBody UserRequest request, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return userService.createUser(request, currentUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public UserResponse updateUserData(@PathVariable Integer id, @RequestBody UserRequest request, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return userService.updateUserDataByAdminOrOperate(id, request, currentUser);
    }

    @PostMapping("/{userId}/teams/{teamId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public void addUserToTeam(@PathVariable Integer userId, @PathVariable Integer teamId, @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.addUserToTeam(userId, teamId, currentUser);
    }

    @DeleteMapping("/{userId}/teams/{teamId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TRAINER')")
    public void removeUserFromTeam(@PathVariable Integer userId, @PathVariable Integer teamId, @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.removeUserFromTeam(userId, teamId, currentUser);
    }


    @PutMapping("/reset-password/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public void resetPassword(@PathVariable Integer id, @RequestParam String newPassword, @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.resetPasswordByAdminOrOperate(id, newPassword, currentUser);
    }

    @PutMapping("/me/change-password")
    public void changeOwnPassword(@RequestParam String oldPassword, @RequestParam String newPassword, @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.changeOwnPassword(currentUser, oldPassword, newPassword);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public void deleteUser(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.deleteUser(id, currentUser);
    }
}

