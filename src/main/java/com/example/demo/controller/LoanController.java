package com.example.demo.controller;

import com.example.demo.dto.requests.CreateLoanRequest;
import com.example.demo.dto.requests.UpdateLoanRequest;
import com.example.demo.dto.responses.FineResponse;
import com.example.demo.dto.responses.LoanResponse;
import com.example.demo.services.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/loans")

public class LoanController {
    LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(@RequestBody CreateLoanRequest request) {
      LoanResponse loanResponse= loanService.createLoan(request);
    return ResponseEntity.ok(loanResponse);}

    @GetMapping("/username")
    public List<LoanResponse> getAllLoans() {
        return loanService.getAllLoans();
    }

    @GetMapping("/fines")
    public List<LoanResponse> getLoanByUsername(@RequestParam(required = false) String username) {
        return loanService.getLoanByUsername(username);
    }

    @GetMapping("/id/{loanId}")
    public LoanResponse getOneLoan(@PathVariable Long loanId) {
        return loanService.getOneLoan(loanId);
    }

    @GetMapping("/fine")
    public List<FineResponse> getFinesByUserName(@RequestParam String username) {
        return loanService.getFineByUserName(username);

    }
    @PutMapping("/{loanId}/return")
    public ResponseEntity<LoanResponse> returnOneLoan(@PathVariable Long loanId) {
        LoanResponse returnedLoan = loanService.returnLoan(loanId);
        return ResponseEntity.ok(returnedLoan);
    }


    @PutMapping("/{loanId}")
    public ResponseEntity<LoanResponse> updateOneLoan(@PathVariable Long loanId, @RequestBody UpdateLoanRequest request) {
        LoanResponse updatedLoan = loanService.updateOneLoan(loanId, request);
        return ResponseEntity.ok(updatedLoan);

    }

    @DeleteMapping("/{loanId}")
    public void deleteOneLoan(@PathVariable Long loanId) {
        loanService.deleteOneLoan(loanId);
    }
}
