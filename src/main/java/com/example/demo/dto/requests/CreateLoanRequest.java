package com.example.demo.dto.requests;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateLoanRequest {
    private UUID userId;
    private UUID bookId;
}
