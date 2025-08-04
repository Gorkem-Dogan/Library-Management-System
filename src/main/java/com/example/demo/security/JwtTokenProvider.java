package com.example.demo.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtTokenProvider {
    @Value("${example.app.secret}")
    private String APP_SECRET;
    @Value("${email.validation.secret}")
    private String EMAIL_SECRET;
    @Value("${example.expires.in}")
    private long EXPIRES_IN;

    public String generateEmailVerificationToken(UUID userId) {
        return Jwts.builder().setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                .claim("name","Email-Verification")
                .signWith(SignatureAlgorithm.HS256, EMAIL_SECRET)
                .compact();
    }

    public String generateJwtToken(Authentication auth) {
        JwtUserDetails userDetails = (JwtUserDetails) auth.getPrincipal();
        Date expireDate = new Date(new Date().getTime() + EXPIRES_IN);
        return Jwts.builder().setSubject(userDetails.getUserId().toString())
                .setIssuedAt(new Date()).setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS256, APP_SECRET).compact();
    }

    public String generateJwtTokenByUserId(UUID userId) {
        Date expireDate = new Date(new Date().getTime() + EXPIRES_IN);
        return Jwts.builder().setSubject(userId.toString())
                .setIssuedAt(new Date()).setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS256, APP_SECRET).compact();
    }

    public UUID getUserIdFromJwt(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(APP_SECRET)
                .parseClaimsJws(token)
                .getBody();
        return UUID.fromString(claims.getSubject());
    }
    public UUID getUserIdFromEmailToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(EMAIL_SECRET)
                .parseClaimsJws(token)
                .getBody();
        return UUID.fromString(claims.getSubject());
    }

    public boolean validateEmailToken(String token) {
        try {
            Jwts.parser().setSigningKey(EMAIL_SECRET).parseClaimsJws(token);
            return !isEmailTokenExpired(token);
        } catch (SignatureException e) {
            return false;
        } catch (MalformedJwtException e) {
            return false;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (UnsupportedJwtException e) {
            return false;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(APP_SECRET).parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (SignatureException e) {
            return false;
        } catch (MalformedJwtException e) {
            return false;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (UnsupportedJwtException e) {
            return false;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser().setSigningKey(APP_SECRET).parseClaimsJws(token).getBody().getExpiration();
        return expiration.before(new Date());
    }
    private boolean isEmailTokenExpired(String token) {
        Date expiration = Jwts.parser().setSigningKey(EMAIL_SECRET).parseClaimsJws(token).getBody().getExpiration();
        return expiration.before(new Date());}

    // Token'dan username (veya email) al
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Token'dan expiration zamanı
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Token geçerli mi
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Genel amaçlı claim çekici
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Token'ı parse et
    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .setSigningKey(APP_SECRET)
                .parseClaimsJws(token)
                .getBody();
    }


}
