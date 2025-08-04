package com.example.demo.services;
import com.example.demo.entities.User;
import com.example.demo.entities.VerificationToken;
import com.example.demo.repos.VerificationTokenRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailVerificationService {
    private EmailService emailService;
    private final VerificationTokenRepository tokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public EmailVerificationService(
            VerificationTokenRepository tokenRepository,
            JwtTokenProvider tokenProvider,
            UserService userService,
            EmailService emailService
    ) {
        this.tokenRepository = tokenRepository;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.emailService=emailService;
    }

    public String createVerificationToken(User user) {
        String token = tokenProvider.generateEmailVerificationToken(user.getId());
        VerificationToken entity = new VerificationToken();
        entity.setUser(user);
        entity.setToken(token);
        entity.setExpiryDate(LocalDateTime.now().plusHours(24));
        entity.setVerified(false);
        tokenRepository.save(entity);
        return token;
    }
    public void sendVerificationEmail(String toEmail, String token) {
        String link = "http://localhost:8080/auth/verify?token=" +  token;
        String subject = "Email Verification - KutuphaneApp";
        String body = "Please verify your email by clicking the link below:\n" + link +
                "\n\nThis link will expire in 15 minutes.";

        emailService.sendEmail(toEmail, subject, body);
    }

    public boolean verifyToken(String token) {
        if (!tokenProvider.validateEmailToken(token)) return false;

        UUID userId = tokenProvider.getUserIdFromEmailToken(token);
        VerificationToken tokenEntity = tokenRepository.findByToken(token).orElse(null);
        if (tokenEntity == null || tokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) return false;

        tokenEntity.setVerified(true);
        tokenRepository.save(tokenEntity);

        userService.markEmailVerified(userId); // set a flag on user if needed
        return true;
    }
}

