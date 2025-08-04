package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "loan")
@Data

public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private LocalDate loanDate;
    @Column(nullable = false)
    private LocalDate dueDate;
    @Column(nullable = true)
    private LocalDate returnDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status = LoanStatus.ACTIVE;

    public Loan() {

    }
}

