package com.example.demo.dto.responses;

import com.example.demo.entities.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserResponse
{
    UUID id;
    String email;
    String firstName;
    String lastName;
    UserRole role;
    boolean active;
    LocalDateTime createdAt;
    String getFullName()
    {
        return firstName+" "+lastName;
    }

    public UserResponse(UUID id, String email) {
        this.id = id;
        this.email = email;
    }




}
