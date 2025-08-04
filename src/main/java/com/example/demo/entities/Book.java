package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Entity
@Table(name = "book")
@Getter
@Setter
public class Book {
    @Id
    @GeneratedValue
    private UUID id;
    @Column(nullable = true,unique = true)
    private String isbn;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String author;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Genre genre;
    @Column(nullable = true)
    private String description;
    @Column(nullable = false)
    private String shelfLocation;
    @Column(nullable = false)
    private Long numberOfCopies;
    @Column(nullable = false)
    private Long availableCopies;
    @Column(nullable = true)
    private String publicationYear;

}
