package com.example.demo.controller;

import com.example.demo.dto.requests.BookRequest;
import com.example.demo.dto.requests.CreateBookRequest;
import com.example.demo.dto.responses.BookResponse;
import com.example.demo.dto.responses.LoanResponse;
import com.example.demo.services.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/books")

public class BookController {
    private final BookService bookService;


    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<BookResponse> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookResponse>> searchBooks(@RequestParam(required = false) String title, @RequestParam(required = false) String author, @RequestParam(required = false) String genre,
                                                          @RequestParam(required = false) String isbn
    ) {
        List<BookResponse> result;
        if (Objects.nonNull(title)) {
            result = bookService.findByTitleContainingIgnoreCase(title);
        } else if (Objects.nonNull(author)) {
            result = bookService.findByAuthorContainingIgnoreCase(author);
        } else if (Objects.nonNull(genre)) {
            result = bookService.searchByGenre(genre);
        } else if (Objects.nonNull(isbn)) {
            result = bookService.findByIsbnContainingIgnoreCase(isbn);

        } else {
            result = bookService.getAllBooks();
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createOneBook(@RequestBody CreateBookRequest bookRequest) {
        return ResponseEntity.ok(bookService.createOneBook(bookRequest));
    }

    @PutMapping("/{bookId}")
    public BookResponse updateOneBook(@RequestBody BookRequest bookRequest, @PathVariable UUID bookId) {
        return bookService.updateOneBook(bookId, bookRequest);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<BookResponse> getOneBook(@PathVariable UUID bookId) {
        BookResponse bookResponse = bookService.getOneBook(bookId);
        return ResponseEntity.ok(bookResponse);
    }

    @GetMapping("/title")
    public List<LoanResponse> getABooksLoans(@RequestParam String title) {
        return bookService.getABooksLoans(title);
    }

    @DeleteMapping("/{bookId}")
    public void deleteOneBook(@PathVariable UUID bookId) {
        bookService.deleteOneBook(bookId);
    }


}
