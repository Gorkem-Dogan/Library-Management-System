package com.example.demo.services;

import com.example.demo.entities.Fine;
import com.example.demo.entities.FineStatus;
import com.example.demo.entities.Loan;
import com.example.demo.entities.LoanStatus;
import com.example.demo.repos.FineRepository;
import com.example.demo.repos.LoanRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class FineCalculationService {
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private static final BigDecimal FINE_PER_DAY = new BigDecimal("5");

    public FineCalculationService(LoanRepository loanRepository, FineRepository fineRepository) {
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
    }

    @Scheduled(cron = "0 13 14 * * ?")
    @Transactional
    public void calculateOverdueFines() {
        // Find all active loans that are overdue.

        List<Loan> overdueLoans = loanRepository.findOverdueLoans(LoanStatus.ACTIVE, LocalDate.now());
        for (Loan loan : overdueLoans)
        {
            Fine existingFine = fineRepository.findByLoan(loan).orElse(new Fine());

            Long daysOverDue= ChronoUnit.DAYS.between(loan.getDueDate(),LocalDate.now());
            if(daysOverDue>0){LoanStatus status= LoanStatus.OVERDUE;
            loan.setStatus(status);}
            loanRepository.save(loan);
            BigDecimal newAmount = FINE_PER_DAY.multiply(new BigDecimal(daysOverDue));


            existingFine.setLoan(loan);
            existingFine.setAmount(newAmount);
            existingFine.setStatus(FineStatus.UNPAID);
            existingFine.setCreationDate(LocalDate.now());

            fineRepository.save(existingFine);
        }
    }
    }
