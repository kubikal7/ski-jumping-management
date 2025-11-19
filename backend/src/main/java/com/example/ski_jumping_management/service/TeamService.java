package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.exceptions.BadRequestException;
import com.example.ski_jumping_management.exceptions.ConflictException;
import com.example.ski_jumping_management.model.Team;
import com.example.ski_jumping_management.model.User;
import com.example.ski_jumping_management.repository.TeamRepository;
import com.example.ski_jumping_management.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public Team getTeamById(Integer id) {
        return teamRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Team not found"));
    }

    public Page<Team> getTeams(int page, int size, List<Integer> teamIds, String name, String sortDirection) {
        Sort.Direction direction = Sort.Direction.fromOptionalString(sortDirection)
                .orElse(Sort.Direction.ASC);

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "name"));

        return teamRepository.findTeams(teamIds, name, pageable);
    }

    public List<User> getUsersByTeamId(Integer teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new EntityNotFoundException("Team not found");
        }

        return userRepository.findAthletesByTeamIdOrderByLastNameAsc(teamId);
    }

    public Team createTeam(Team team) {
        if (teamRepository.existsByNameIgnoreCase(team.getName())) {
            throw new ConflictException("Team with this name already exists");
        }
        return teamRepository.save(team);
    }

    public Team updateTeam(Integer id, Team team) {
        Team existingTeam = teamRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Team not found"));

        if (teamRepository.existsByNameIgnoreCase(team.getName()) && !existingTeam.getName().equalsIgnoreCase(team.getName())) {
            throw new ConflictException("Team with this name already exists");
        }

        existingTeam.setName(team.getName());
        existingTeam.setDescription(team.getDescription());
        return teamRepository.save(existingTeam);
    }

    public void deleteTeam(Integer id) {
        Team team = teamRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Team not found"));

        userRepository.removeTeamFromUsers(id);

        teamRepository.delete(team);
    }
}
