package com.example.demo.services;

import com.example.demo.dto.requests.UserRequest;
import com.example.demo.dto.responses.AuthResponse;
import com.example.demo.dto.responses.RegisterAuthResponse;
import com.example.demo.entities.User;
import com.example.demo.repos.RefreshTokenRepository;
import com.example.demo.repos.UserRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private AuthenticationManager authenticationManager;

    private JwtTokenProvider jwtTokenProvider;

    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;

    private final RefreshTokenRepository refreshTokenRepository;

    private final RefreshTokenService tokenService;

    private EmailVerificationService emailVerificationService;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider,
                       UserRepository userRepository, PasswordEncoder passwordEncoder,
                       RefreshTokenRepository refreshTokenRepository, RefreshTokenService tokenService, EmailVerificationService emailVerificationService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenService = tokenService;
        this.emailVerificationService = emailVerificationService;
    }
    public RegisterAuthResponse register( UserRequest registerRequest) {
        RegisterAuthResponse authResponse = new RegisterAuthResponse();
        if (userRepository.findByUsername(registerRequest.getUsername()) != null) {
            authResponse.setMessage("Username already in use.");
            return authResponse;
        }
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        userRepository.save(user);
        String verificationToken = emailVerificationService.createVerificationToken(user);
        emailVerificationService.sendVerificationEmail(user.getEmail(), verificationToken);

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword());
        Authentication auth = authenticationManager.authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(auth);
        if (!user.isActive()) {
            authResponse.setMessage("Registration successful. Please verify your email to activate your account.");
            return authResponse;
        }
        String jwtToken = jwtTokenProvider.generateJwtToken(auth);
        return authResponse;
    }
    public AuthResponse login( UserRequest loginRequest) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword());
        Authentication auth = authenticationManager.authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwtToken = jwtTokenProvider.generateJwtToken(auth);
        User user = userRepository.findByUsername(loginRequest.getUsername());
        if (!user.isActive()) {
            throw new DisabledException("Account is not verified. Please check your email.");
        }
        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken("Bearer " + jwtToken);
        //       authResponse.setRefreshToken(refreshTokenService.createRefreshToken(user));
        authResponse.setUserId(user.getId());
        authResponse.setMessage("Has been logged into Library Successfully!!\n You may update your credentials at wish!");
        return authResponse;
    }
}