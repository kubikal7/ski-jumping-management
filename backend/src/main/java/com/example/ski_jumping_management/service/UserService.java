package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.DTO.UserRequest;
import com.example.ski_jumping_management.DTO.UserResponse;
import com.example.ski_jumping_management.exceptions.BadRequestException;
import com.example.ski_jumping_management.exceptions.ConflictException;
import com.example.ski_jumping_management.model.Role;
import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.model.User;
import com.example.ski_jumping_management.model.UserRole;
import com.example.ski_jumping_management.repository.RoleRepository;
import com.example.ski_jumping_management.repository.TeamRepository;
import com.example.ski_jumping_management.repository.UserRepository;
import com.example.ski_jumping_management.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private void validateNewPassword(String newPassword, String oldPasswordHash) {
        Pattern pattern = Pattern.compile(
                "^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-={}\\[\\];':\"\\\\|,.<>/?]).{8,}$"
        );

        if (!pattern.matcher(newPassword).matches()) {
            throw new BadRequestException(
                    "Password must be at least 8 characters long with at least one uppercase letter, one digit and one special character"
            );
        }

        if (passwordEncoder.matches(newPassword, oldPasswordHash)) {
            throw new BadRequestException("New password must be different from old password");
        }
    }


    public boolean hasAnyRole(CustomUserDetails userDetails, UserRole... roles) {
        if (userDetails == null || userDetails.getAuthorities() == null) return false;
        return userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .anyMatch(roleName -> {
                    for (UserRole r : roles) {
                        if (roleName.equals(r.name())) return true;
                    }
                    return false;
                });
    }

    private Set<Role> mapRoleIdsToRoles(Set<Integer> roleIds) {
        return roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new BadRequestException("Role not found")))
                .collect(Collectors.toSet());
    }

    private Set<Team> mapTeamIdsToTeams(Set<Integer> teamIds) {
        return teamIds.stream()
                .map(teamId -> teamRepository.findById(teamId).orElseThrow(() -> new BadRequestException("Team not found")))
                .collect(Collectors.toSet());
    }

    public UserResponse getUserById(Integer id) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    public Page<UserResponse> getUsers(
            Boolean active,
            BigDecimal minHeight,
            BigDecimal maxHeight,
            BigDecimal minWeight,
            BigDecimal maxWeight,
            LocalDate birthDateFrom,
            LocalDate birthDateTo,
            List<Integer> teamIds,
            String search,
            List<Integer> roleIds,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort sort;

        if (sortBy == null || sortBy.isEmpty()) {
            sort = Sort.by(Sort.Direction.ASC, "lastName");
        } else {
            Sort.Direction direction = Sort.Direction.fromOptionalString(sortDirection).orElse(Sort.Direction.ASC);
            sort = Sort.by(direction, sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> usersPage = userRepository.findUsers(
                active, minHeight, maxHeight, minWeight, maxWeight,
                birthDateFrom, birthDateTo, teamIds, roleIds, search, pageable
        );

        return usersPage.map(UserResponse::fromEntity);
    }

    public UserResponse createUser(UserRequest request, CustomUserDetails currentUser) {
        if (userRepository.existsByLogin(request.getLogin())) {
            throw new ConflictException("Login already exists");
        }

        boolean isManager = hasAnyRole(currentUser, UserRole.MANAGER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            throw new BadRequestException("User must have at least one role");
        }

        Set<Role> roles = mapRoleIdsToRoles(request.getRoles());
        if (isManager && !isAdmin && roles.stream().anyMatch(r -> r.getName() == UserRole.ADMIN)) {
            throw new AccessDeniedException("You cannot assign ADMIN role");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setLogin(request.getLogin());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);
        user.setBirthDate(request.getBirthDate());
        user.setNationality(request.getNationality());
        user.setPhotoUrl(request.getPhotoUrl());
        user.setWeight(request.getWeight());
        user.setHeight(request.getHeight());
        user.setActive(true);

        if (request.getTeamIds() != null) {
            user.setTeams(mapTeamIdsToTeams(request.getTeamIds()));
        }

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    public UserResponse updateUserDataByAdminOrOperate(Integer id, UserRequest request, CustomUserDetails currentUser) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (userRepository.existsByLogin(request.getLogin()) && !Objects.equals(request.getLogin(), user.getLogin())) {
            throw new ConflictException("Login already exists");
        }

        boolean isManager = hasAnyRole(currentUser, UserRole.MANAGER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (isManager && !isAdmin && hasAnyRole(new CustomUserDetails(user), UserRole.ADMIN)) {
            throw new AccessDeniedException("You cannot modify ADMIN user");
        }

        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            throw new BadRequestException("User must have at least one role");
        }

        Set<Role> newRoles = mapRoleIdsToRoles(request.getRoles());
        if (isManager && !isAdmin && newRoles.stream().anyMatch(r -> r.getName().equals(UserRole.ADMIN))) {
            throw new AccessDeniedException("You cannot assign ADMIN role");
        }
        user.setRoles(newRoles);

        user.setTeams(mapTeamIdsToTeams(request.getTeamIds()));


        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setLogin(request.getLogin());
        user.setBirthDate(request.getBirthDate());
        user.setNationality(request.getNationality());
        user.setPhotoUrl(request.getPhotoUrl());
        user.setWeight(request.getWeight());
        user.setHeight(request.getHeight());
        user.setActive(request.getActive());

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    public void addUserToTeam(Integer userId, Integer teamId, CustomUserDetails currentUser) {
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);

        if (!isAdmin && !isTrainer) {
            throw new AccessDeniedException("You cannot add user to team");
        }

        if (!isAdmin && isTrainer) {
            boolean hasTeam = currentUser.getUser().getTeams().stream()
                    .anyMatch(t -> t.getId().equals(teamId));
            if (!hasTeam) {
                throw new AccessDeniedException("Trainer does not have access to this team");
            }
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        var team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found"));

        boolean alreadyInTeam = user.getTeams().stream()
                .anyMatch(t -> t.getId().equals(teamId));
        if (alreadyInTeam) {
            throw new BadRequestException("User is already a member of this team");
        }

        userRepository.addUserToTeam(userId, teamId);
    }

    public void removeUserFromTeam(Integer userId, Integer teamId, CustomUserDetails currentUser) {
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);
        boolean isTrainer = hasAnyRole(currentUser, UserRole.TRAINER);

        if (!isAdmin && !isTrainer) {
            throw new AccessDeniedException("Ypou cannot remove user from team");
        }

        if (!isAdmin && isTrainer) {
            boolean hasTeam = currentUser.getUser().getTeams().stream()
                    .anyMatch(t -> t.getId().equals(teamId));
            if (!hasTeam) {
                throw new AccessDeniedException("Trainer does not have access to this team");
            }
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        var team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found"));

        boolean isMember = user.getTeams().stream()
                .anyMatch(t -> t.getId().equals(teamId));
        if (!isMember) {
            throw new BadRequestException("User is not a member of this team");
        }

        userRepository.removeUserFromTeam(userId, teamId);
    }

    public void resetPasswordByAdminOrOperate(Integer id, String newPassword, CustomUserDetails currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isManager = hasAnyRole(currentUser, UserRole.MANAGER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (isManager && !isAdmin && hasAnyRole(new CustomUserDetails(user), UserRole.ADMIN)) {
            throw new AccessDeniedException("You cannot reset password for ADMIN user");
        }

        validateNewPassword(newPassword, user.getPasswordHash());

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);
    }

    public void changeOwnPassword(CustomUserDetails currentUser, String oldPassword, String newPassword) {
        User user = userRepository.findByLogin(currentUser.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Wrong old password");
        }

        validateNewPassword(newPassword, user.getPasswordHash());

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    public void deleteUser(Integer id, CustomUserDetails currentUser) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isManager = hasAnyRole(currentUser, UserRole.MANAGER);
        boolean isAdmin = hasAnyRole(currentUser, UserRole.ADMIN);

        if (isManager && !isAdmin && hasAnyRole(new CustomUserDetails(user), UserRole.ADMIN)) {
            throw new AccessDeniedException("You cannot delete ADMIN user");
        }

        userRepository.delete(user);
    }

    public void updateLastLogin(Integer userId, LocalDateTime loginDate) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setLastLogin(loginDate);
        userRepository.save(user);
    }
}
