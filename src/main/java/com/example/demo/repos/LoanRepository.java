package com.example.demo.repos;

import com.example.demo.entities.Book;
import com.example.demo.entities.Loan;
import com.example.demo.entities.LoanStatus;
import com.example.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository

public interface LoanRepository extends JpaRepository<Loan,Long> {

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user = :user AND l.status = :status")
    Long countByUserAndStatus(@Param("user") User user, @Param("status") LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN l.user u JOIN l.book b WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :username ))")
    List<Loan> getLoanByUsername(@Param("username") String username);
    @Query("SELECT l FROM Loan l WHERE l.status = :status AND l.dueDate < :now")
    List<Loan> findOverdueLoans(@Param("status") LoanStatus loanStatus, @Param("now") LocalDate currentDate);
}

