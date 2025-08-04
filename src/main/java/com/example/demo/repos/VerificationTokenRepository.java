package com.example.demo.repos;

import com.example.demo.entities.User;
import com.example.demo.entities.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByToken(String token);

    VerificationToken findByUser(User user);
}
