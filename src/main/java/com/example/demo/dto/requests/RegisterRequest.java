package com.example.demo.dto.requests;

import lombok.Data;
@Data
public class RegisterRequest
{
    String email;
    String password;
    String firstName;
    String lastName;
}
