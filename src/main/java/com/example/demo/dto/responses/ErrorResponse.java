package com.example.demo.dto.responses;

import lombok.Data;

import java.time.LocalDateTime;
@Data

public class ErrorResponse {
    private final String message;
    private final LocalDateTime timestamp;
    public ErrorResponse(String message )
    {
        this.message=message;
        this.timestamp=LocalDateTime.now();
    }

}
