package com.example.demo.dto.requests;

import lombok.Data;

@Data
public class UserRequest {
    String username;
    String password;
    String email;
}
