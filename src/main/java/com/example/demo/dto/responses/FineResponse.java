package com.example.demo.dto.responses;

import lombok.Data;

@Data
public class FineResponse {
    String loanId;
    String userId;
    String bookTitle;
    String fineAmount;
    String fineStatus;


}
