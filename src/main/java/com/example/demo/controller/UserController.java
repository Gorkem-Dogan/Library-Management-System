package com.example.demo.controller;

import com.example.demo.dto.requests.CreateUserRequest;
import com.example.demo.dto.requests.UpdateUserRequest;
import com.example.demo.dto.responses.UserResponse;
import com.example.demo.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")

public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createOneUser(@RequestBody CreateUserRequest requestUser) {
        UserResponse response= userService.createOneUser(requestUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateOneUser(@PathVariable UUID userId, @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateOneUser(userId, request);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
         List<UserResponse> response = userService.getAllUsers();
         return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getOneUser(@PathVariable UUID userId) {
        UserResponse response= userService.getOneUser(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    public void deleteOneUser(@PathVariable UUID userId) {
        userService.deleteOneUser(userId);
    }
}
