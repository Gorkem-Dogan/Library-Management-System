package com.example.demo.controller;

import com.example.demo.dto.requests.RefreshRequest;
import com.example.demo.dto.responses.RegisterAuthResponse;
import com.example.demo.services.*;
import com.example.demo.dto.requests.UserRequest;
import com.example.demo.dto.responses.AuthResponse;
import com.example.demo.entities.RefreshToken;
import com.example.demo.entities.User;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")

public class AuthController {

    private JwtTokenProvider jwtTokenProvider;

    private UserService userService;

    private RefreshTokenService refreshTokenService;

    private EmailVerificationService emailVerificationService;

    private AuthService authService;


    public AuthController(UserDetailsServiceImpl userDetailsService, AuthenticationManager authenticationManager, UserService userService,
                          PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, RefreshTokenService refreshTokenService,
                          EmailVerificationService emailVerificationService, AuthService authService) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationService = emailVerificationService;

        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterAuthResponse> register(@RequestBody UserRequest registerRequest) {
        RegisterAuthResponse response = authService.register(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UserRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verify(@RequestParam("token") String token) {
        boolean success = emailVerificationService.verifyToken(token);
        if (success) {
            return ResponseEntity.ok("Email verified successfully.");
        }
        return ResponseEntity.badRequest().body("Invalid or expired token.");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resend(@RequestParam String email) {
        User user = userService.getOneUserByEmail(email);
        if (user.isActive()) {
            return ResponseEntity.badRequest().body("Invalid request.");
        }
        String token = emailVerificationService.createVerificationToken(user);
        emailVerificationService.sendVerificationEmail(user.getEmail(), token);
        return ResponseEntity.ok("Verification email resent.");
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest refreshRequest) {
        AuthResponse response = new AuthResponse();
        RefreshToken token = refreshTokenService.getByUser(refreshRequest.getUserId());
        if (token.getToken().equals(refreshRequest.getRefreshToken()) &&
                !refreshTokenService.isRefreshExpired(token)) {

            User user = token.getUser();
            String jwtToken = jwtTokenProvider.generateJwtTokenByUserId(user.getId());
            response.setMessage("token successfully refreshed.");
            response.setAccessToken("Bearer " + jwtToken);
            response.setRefreshToken(refreshTokenService.createRefreshToken(user));
            response.setUserId(user.getId());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.setMessage("refresh token is not valid.");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

    }


}



