package com.example.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class VerificationToken {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
    private User user;
    @JsonIgnore
    @Column
    private LocalDateTime expiryDate;
    @Column
    private boolean verified;

    // Optional: token type (email, password_reset, etc.)
    // private TokenType tokenType;
}
