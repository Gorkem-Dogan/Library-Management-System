package com.example.demo.repos;

import com.example.demo.entities.User;
import com.example.demo.entities.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);

    User findByUsername(String username);

    User getOneUserByEmail(String email);
}
