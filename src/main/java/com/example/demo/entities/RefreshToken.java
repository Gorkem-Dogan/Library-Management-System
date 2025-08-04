package com.example.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.Date;
import java.util.UUID;


@Entity
    @Table(name="refresh_token")
    @Getter
    @Setter
    public class RefreshToken {
        @Id
        @GeneratedValue
        UUID id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name="user_id", nullable=false)
        @OnDelete(action = OnDeleteAction.CASCADE)
        @JsonIgnore
        User user;

        @Column(nullable = false, unique = true)
        String token;

        @Column(nullable = false)
        @Temporal(TemporalType.TIMESTAMP)
        Date expiryDate;
}
