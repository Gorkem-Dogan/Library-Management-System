package com.example.demo.repos;

import com.example.demo.entities.Fine;
import com.example.demo.entities.FineStatus;
import com.example.demo.entities.Loan;
import com.example.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository

public interface FineRepository extends JpaRepository<Fine,UUID>
{

    Optional<Fine> findByLoan(Loan loan);

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fine f WHERE f.loan.user = :user AND f.status = :status")
    BigDecimal sumAmountByUserAndStatus(@Param("user") User user, @Param("status") FineStatus status);

    @Query("""
           SELECT f
           FROM Fine f
           JOIN FETCH f.loan l
           JOIN FETCH l.user u
           LEFT JOIN FETCH l.book b
           WHERE LOWER(u.username) = LOWER(:username)
           """)
    List<Fine> getFinesByUserName(@Param("username") String username);

}
