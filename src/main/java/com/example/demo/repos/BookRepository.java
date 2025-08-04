package com.example.demo.repos;

import com.example.demo.dto.requests.BookRequest;
import com.example.demo.entities.Book;
import com.example.demo.entities.Genre;
import com.example.demo.entities.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository

public interface BookRepository extends JpaRepository<Book, UUID> {
    List<Book> findByTitleContainingIgnoreCase(String title);

    List<Book> findByAuthorContainingIgnoreCase(String author);

    @Query(value = "SELECT * FROM book WHERE genre = :genre", nativeQuery = true)
    List<Book> findByGenre(@Param("genre") String genre);

    @Query("SELECT b FROM Book b WHERE LOWER(b.genre) LIKE LOWER(CONCAT('%', :genre, '%'))")
    List<Book> searchByGenre(@Param("genre") String genre);

    List<Book> findByIsbnContainingIgnoreCase(String isbn);

    @Query("SELECT l FROM Loan l JOIN l.book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Loan> findLoansByBookTitle(@Param("title") String title);
}
