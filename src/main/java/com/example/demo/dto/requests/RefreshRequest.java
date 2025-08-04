package com.example.demo.dto.requests;

import lombok.Data;
import java.util.UUID;
@Data
public class RefreshRequest {

    UUID userId;
    String refreshToken;
}
