package com.example.demo.dto.responses;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
@NoArgsConstructor
@Data
public class BookResponse {
    UUID id;
    String isbn;
    String title;
    String author;
    String description;
    String shelfLocation;
    Long numberOfCopies;
    Long availableCopies;
    String publicationYear;
    String genre;
}