package com.example.demo.dto.requests;

import com.example.demo.entities.Genre;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class  CreateBookRequest {String isbn;

    String title;

    String author;

    Genre genre;

    String description;

    String shelfLocation;

    Long numberOfCopies;

    Long availableCopies;

    String publicationYear;


}
