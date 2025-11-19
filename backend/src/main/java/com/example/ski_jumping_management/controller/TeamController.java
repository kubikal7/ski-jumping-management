package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.model.User;
import com.example.ski_jumping_management.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping("/{id}")
    public Team getTeamById(@PathVariable Integer id) {
        return teamService.getTeamById(id);
    }

    @GetMapping("")
    public Page<Team> getTeamsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) List<Integer> teamIds,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sortDirection
    ) {
        return teamService.getTeams(page, size, teamIds, name, sortDirection);
    }

    @GetMapping("/{teamId}/users")
    public List<User> getUsersByTeam(@PathVariable Integer teamId) {
        return teamService.getUsersByTeamId(teamId);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public Team createTeam(@RequestBody Team team) {
        return teamService.createTeam(team);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public Team updateTeam(@PathVariable Integer id, @RequestBody Team team) {
        return teamService.updateTeam(id, team);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public void deleteTeam(@PathVariable Integer id) {
        teamService.deleteTeam(id);
    }
}
