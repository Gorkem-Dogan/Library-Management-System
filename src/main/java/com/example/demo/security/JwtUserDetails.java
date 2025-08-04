package com.example.demo.security;

import com.example.demo.entities.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class JwtUserDetails implements UserDetails {

    private UUID userId;
    private String email;
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public JwtUserDetails(UUID userId, String email, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    public static JwtUserDetails create(User user) {
        List<GrantedAuthority> authoritiesList = List.of(new SimpleGrantedAuthority(user.getRole().name()));
        return new JwtUserDetails(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getPassword(),
                authoritiesList
        );
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

