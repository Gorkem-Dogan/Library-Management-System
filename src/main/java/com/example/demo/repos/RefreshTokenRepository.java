package com.example.demo.repos;

import com.example.demo.entities.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    RefreshToken findByUserId(UUID id);
}
