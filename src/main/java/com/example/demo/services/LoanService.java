package com.example.demo.services;

import com.example.demo.dto.requests.CreateLoanRequest;
import com.example.demo.dto.requests.UpdateLoanRequest;
import com.example.demo.dto.responses.FineResponse;
import com.example.demo.dto.responses.LoanResponse;
import com.example.demo.entities.*;
import com.example.demo.exceptions.BadRequestException;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repos.BookRepository;
import com.example.demo.repos.FineRepository;
import com.example.demo.repos.LoanRepository;
import com.example.demo.repos.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service

public class LoanService {

    private static final BigDecimal MAX_UNPAID_FINE_AMOUNT = BigDecimal.valueOf(100);
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final ModelMapper modelMapper;


    public LoanService(LoanRepository loanRepository,
                       BookRepository bookRepository, UserRepository userRepository, FineRepository fineRepository, ModelMapper modelMapper) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.fineRepository = fineRepository;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public LoanResponse createLoan(CreateLoanRequest request) {
        User user = userRepository.findById(request.getUserId()).get();
        Book book = bookRepository.findById(request.getBookId()).get();
        Loan loanToCreate = new Loan();


        BigDecimal totalUnpaidFines = fineRepository.sumAmountByUserAndStatus(user, FineStatus.UNPAID);
        if (totalUnpaidFines.compareTo(MAX_UNPAID_FINE_AMOUNT) > 0) {
            throw new BadRequestException("Cannot loan new books. User has an outstanding fine of ₺" + totalUnpaidFines);
        }

        // Rule b) Check if the user has reached their loan limit.
        Long activeLoans = loanRepository.countByUserAndStatus(user, LoanStatus.ACTIVE);
        if (activeLoans >= 5) {
            throw new BadRequestException("User has reached the maximum loan limit");
        }

        // Rule c) Check if the specific book has available copies.
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Book '" + book.getTitle() + "' has no available copies to loan.");
        }

        loanToCreate.setUser(user);
        loanToCreate.setBook(book);
        loanToCreate.setLoanDate(LocalDate.now());
        loanToCreate.setDueDate(LocalDate.now().plusDays(14));
        Loan createdLoan = loanRepository.save(loanToCreate);
        return convertToLoanResponse(createdLoan);
    }

    public List<LoanResponse> getAllLoans() {
        List<Loan> loansFromDb = loanRepository.findAll();
        return loansFromDb.stream()
                .map(this::convertToLoanResponse)
                .toList();
    }

    public LoanResponse getOneLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new ResourceNotFoundException("Respond with the ID " + loanId + " could not be reached or might be non existent "));

        return convertToLoanResponse(loan);
    }

    @Transactional
    public LoanResponse updateOneLoan(Long loanId, UpdateLoanRequest request) {
        Loan loanToUpdate = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + loanId));

        // Update fields from the request, checking for nulls to make updates optional
        if (request.getBookId() != null) {
            Book newBook = bookRepository.findById(request.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: ".concat(String.valueOf(request.getBookId()))));
            loanToUpdate.setBook(newBook);
        }
        if (request.getUserId() != null) {
            User newUser = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: ".concat(String.valueOf(request.getUserId()))));
            loanToUpdate.setUser(newUser);
        }

        loanToUpdate.setLoanDate(request.getLoanDate());
        loanToUpdate.setDueDate(request.getDueDate());
        loanToUpdate.setReturnDate(request.getReturnDate());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                LoanStatus status = LoanStatus.valueOf(request.getStatus().toUpperCase());
                loanToUpdate.setStatus(status);
            } catch (IllegalArgumentException exception) {
                new IllegalArgumentException("Invalid status given : " + request.getStatus());
            }

        }
        Loan savedLoan = loanRepository.save(loanToUpdate);
        return convertToLoanResponse(savedLoan);
    }

    @Transactional
    public void deleteOneLoan(Long loanId) {
        // 1. First, verify the loan exists to provide a clean 404 if not.
        Loan loanToDelete = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot delete. Loan not found with ID: " + loanId));

        // 2. Check for and delete the associated Fine (the "child").
        // This is the crucial step that was missing.
        Optional<Fine> associatedFine = fineRepository.findByLoan(loanToDelete);
        if (associatedFine.isPresent()) {
            fineRepository.delete(associatedFine.get());
        }
        // 3. Now that the child is gone, you can safely delete the parent.
        loanRepository.delete(loanToDelete);
    }

    public LoanResponse returnLoan(Long loanId) {
        Loan loanToReturn = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("The loan with the ID : "
                        + loanId + " you are calling for cannot be called or non existent"));

        if (loanToReturn.getStatus() == LoanStatus.RETURNED) {
            throw new BadRequestException("this book has already been returned");
        }
        loanToReturn.setStatus(LoanStatus.RETURNED);
        loanToReturn.setReturnDate(LocalDate.now());

        Book bookToUpdate = loanToReturn.getBook();
        bookToUpdate.setAvailableCopies((bookToUpdate.getAvailableCopies() + 1));
        bookRepository.save(bookToUpdate);

        Loan loanToSave = loanRepository.save(loanToReturn);
        return convertToLoanResponse(loanToSave);
    }

    public List<LoanResponse> getLoanByUsername(String username) {
        List<Loan> loansFromDb = loanRepository.getLoanByUsername(username);
        return loansFromDb.stream()
                .map(loan -> modelMapper.map(loan, LoanResponse.class))
                .toList();
    }
    private LoanResponse convertToLoanResponse(Loan loan) {
        // We are assuming LoanResponse is a class with Lombok's @Data, @NoArgsConstructor, @AllArgsConstructor.
        // If it's a record, the logic is slightly different (see note below).
        LoanResponse response = new LoanResponse();
        // 1. Map the direct properties from the Loan entity.
        response.setId(loan.getId());
        response.setLoanDate(loan.getLoanDate());
        response.setDueDate(loan.getDueDate());
        response.setReturnDate(loan.getReturnDate());
        response.setStatus(loan.getStatus());
        // 2. Map the nested properties from the related User entity.
        //    It's good practice to check for null in case a relationship is optional.
        if (loan.getUser() != null)
            response.setUserId(loan.getUser().getId());
        response.setUsername(loan.getUser().getUsername());
        // 3. Map the nested properties from the related Book entity.
        if (loan.getBook() != null)
            response.setBookId(loan.getBook().getId());
        response.setBookTitle(loan.getBook().getTitle());
        return response;
    }

    public List<FineResponse> getFineByUserName(String username) {

        List<Fine> finesFromDb= fineRepository.getFinesByUserName(username);
        return finesFromDb.stream().map(this::convertFineToFineResponse).toList();
    }

    private FineResponse convertFineToFineResponse(Fine fine) {
        FineResponse response = new FineResponse();
        Loan loan = fine.getLoan();
        response.setBookTitle(loan.getBook().getTitle());
        response.setUserId(loan.getUser().getId().toString());
        response.setFineAmount(fine.getAmount().toString());
        response.setLoanId(loan.getId().toString());
        response.setFineStatus(String.valueOf(fine.getStatus()));
        return response;




    }
}
