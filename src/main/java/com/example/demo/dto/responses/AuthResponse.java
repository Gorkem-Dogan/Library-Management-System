package com.example.demo.dto.responses;

import lombok.Data;
import java.util.UUID;
@Data
public class AuthResponse {
    String message;
    UUID userId;
    String accessToken;
    String refreshToken;
}
