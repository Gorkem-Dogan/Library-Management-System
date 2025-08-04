package com.example.demo.dto.requests;

import lombok.Data;
import java.util.UUID;
@Data

public class BookRequest {
    private UUID id;

    private String isbn;

    private String title;

    private String author;

    private String description;

    private String shelfLocation;

    private Long numberOfCopies;

    private Long availableCopies;

    private String publicationYear;

    private String Genre;

}
