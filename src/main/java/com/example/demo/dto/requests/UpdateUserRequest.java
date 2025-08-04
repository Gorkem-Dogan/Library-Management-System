package com.example.demo.dto.requests;

import com.example.demo.entities.UserRole;
import lombok.Data;

import java.util.UUID;
@Data
public class UpdateUserRequest {
    private UUID id;

    private String email;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private UserRole role = UserRole.MEMBER;

    private boolean active = false;
}
