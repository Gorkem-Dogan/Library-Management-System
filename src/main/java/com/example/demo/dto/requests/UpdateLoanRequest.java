package com.example.demo.dto.requests;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;
@Data

public class UpdateLoanRequest {
    UUID bookId;
    UUID userId;
    LocalDate loanDate;
    LocalDate returnDate;
    LocalDate dueDate;
    String status;


}