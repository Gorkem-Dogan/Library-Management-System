package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
public class Fine {
    @Id
    @GeneratedValue
    private UUID id;

    // A fine is always linked to a specific loan.
    @OneToOne
    @JoinColumn(name = "loan_id")
    private Loan loan;

    private BigDecimal amount; // Use BigDecimal for money to avoid rounding errors.

    @Enumerated(EnumType.STRING)
    private FineStatus status; // e.g., UNPAID, PAID, WAIVED
    private LocalDate creationDate;
    private LocalDate paymentDate;


}