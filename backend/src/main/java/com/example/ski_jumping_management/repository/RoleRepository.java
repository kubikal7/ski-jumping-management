package com.example.ski_jumping_management.repository;

import com.example.ski_jumping_management.model.Role;
import com.example.ski_jumping_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
}
