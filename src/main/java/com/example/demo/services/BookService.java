package com.example.demo.services;

import com.example.demo.dto.requests.BookRequest;
import com.example.demo.dto.requests.CreateBookRequest;
import com.example.demo.dto.responses.BookResponse;
import com.example.demo.dto.responses.LoanResponse;
import com.example.demo.entities.Book;
import com.example.demo.entities.Genre;
import com.example.demo.entities.Loan;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repos.BookRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service

public class BookService {
    private ModelMapper modelmapper;
    BookRepository bookRepository;

    public BookService(ModelMapper modelmapper, BookRepository bookRepository) {
        this.modelmapper = modelmapper;
        this.bookRepository = bookRepository;

    }

    public ResponseEntity<BookResponse> createOneBook(CreateBookRequest request) {
        Book newBookEntity = modelmapper.map(request, Book.class);
        Book savedEntity = bookRepository.save(newBookEntity);
        BookResponse response = modelmapper.map(savedEntity, BookResponse.class);
        return ResponseEntity.ok(response);
    }

    public List<BookResponse> getAllBooks() {

        List<Book> listOfBooks = bookRepository.findAll();
        return listOfBooks.stream()
                .map(book -> modelmapper.map(book, BookResponse.class))
                .toList();
    }

    public BookResponse getOneBook(UUID bookId) {
        Book bookFromDb = bookRepository.findById(bookId).orElseThrow(()->new ResourceNotFoundException("book could not be found with id"
        +bookId));
        return modelmapper.map(bookFromDb, BookResponse.class);
    }

    public BookResponse updateOneBook(UUID bookId, BookRequest request) {
        Book bookToUpdate = bookRepository.findById(bookId).orElseThrow(()->new ResourceNotFoundException("book could not be found with id"));
        bookToUpdate.setTitle(request.getTitle());
        bookToUpdate.setAuthor(request.getAuthor());
        bookToUpdate.setNumberOfCopies(request.getNumberOfCopies());
        bookToUpdate.setIsbn(request.getIsbn());
        bookToUpdate.setDescription(request.getDescription());
        bookToUpdate.setShelfLocation(request.getShelfLocation());
        bookToUpdate.setAvailableCopies(request.getAvailableCopies());
        bookToUpdate.setNumberOfCopies(request.getNumberOfCopies());
        bookToUpdate.setPublicationYear(request.getPublicationYear());
        if (request.getGenre()!=null && !request.getGenre().isBlank())
        {
            try {
                Genre bookGenre= Genre.valueOf(request.getGenre().toUpperCase());
                bookToUpdate.setGenre(bookGenre);
            }catch (IllegalArgumentException e )
            {
                throw new IllegalArgumentException("Invalid Genre value: '"+ request.getGenre()+"'");
            }
        } Book savedBook = bookRepository.save(bookToUpdate);
        return modelmapper.map(savedBook,BookResponse.class);
    }

    public void deleteOneBook(UUID bookId) {
        bookRepository.deleteById(bookId);
    }

    public List<BookResponse> findByTitleContainingIgnoreCase(String title) {
        List<Book> booksFromDb = bookRepository.findByTitleContainingIgnoreCase(title);
        return booksFromDb.stream().map(book -> modelmapper.map(book, BookResponse.class))
                .toList();
    }

    public List<BookResponse> findByAuthorContainingIgnoreCase(String author) {
        List<Book> booksFromDb = bookRepository.findByAuthorContainingIgnoreCase(author);
        return booksFromDb.stream().map(book -> modelmapper.map(book, BookResponse.class))
                .toList();
    }

    public List<BookResponse> findByIsbnContainingIgnoreCase(String isbn) {

        List<Book> booksFromDb = bookRepository.findByIsbnContainingIgnoreCase(isbn);
        return booksFromDb.stream()
                .map(book -> modelmapper.map(book, BookResponse.class))
                .toList();
//       Old Way of returning a list
//        List<BookResponse> responseList = new ArrayList<>();
//        for (Book book : booksFromDb) {
//            BookResponse dto = modelmapper.map(book, BookResponse.class);
//            responseList.add(dto);
//        }
//        return responseList;
    }

    public List<BookResponse> searchByGenre(String genre) {
        List<Book> booksFromDb = bookRepository.searchByGenre(genre);
        return booksFromDb.stream()
                .map(book -> modelmapper.map(book, BookResponse.class))
                .toList();
    }

    public List<LoanResponse> getABooksLoans(String title) {
        List<Loan> loansFromDb = bookRepository.findLoansByBookTitle(title);
        return loansFromDb.stream()
                .map(loan -> modelmapper.map(loan, LoanResponse.class))
                .toList();
    }
}
