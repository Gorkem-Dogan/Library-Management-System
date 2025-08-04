package com.example.demo.entities;

public enum LoanStatus {
    ACTIVE,       // Loan is currently active
    RETURNED,     // Book has been returned
    OVERDUE,      // Book is past due date
    LOST,         // Book was reported lost
    CANCELLED     // Loan was cancelled before completion
}
