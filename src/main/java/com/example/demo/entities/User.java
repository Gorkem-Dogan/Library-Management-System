package com.example.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.validation.annotation.Validated;

import java.io.Serial;
import java.rmi.server.UID;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data

public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = true, unique = true)
    private String email;

    @Column(nullable = false,unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true)
    private String firstName;

    @Column(nullable = true)
    private String lastName;
    @Transient
    public  String getFullName()
    {
         return firstName+" "+lastName;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private UserRole role = UserRole.MEMBER;

    @Column(nullable = true)
    private boolean active = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
