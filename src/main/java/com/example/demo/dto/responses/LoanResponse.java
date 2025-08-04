package com.example.demo.dto.responses;

import com.example.demo.entities.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {
    private Long id;
    private UUID userId;
    private String username;        // Optional, but helpful
    private UUID bookId;
    private String bookTitle;       // Optional, for better frontend display
    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private LoanStatus status;

}
