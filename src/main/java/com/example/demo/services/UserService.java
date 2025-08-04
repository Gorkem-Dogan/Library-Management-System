package com.example.demo.services;

import com.example.demo.dto.requests.CreateUserRequest;
import com.example.demo.dto.requests.UpdateUserRequest;
import com.example.demo.dto.responses.UserResponse;
import com.example.demo.entities.Fine;
import com.example.demo.entities.Loan;
import com.example.demo.entities.User;
import com.example.demo.entities.VerificationToken;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repos.UserRepository;
import com.example.demo.repos.VerificationTokenRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service

public class UserService {
    ModelMapper modelMapper;
    UserRepository userRepository;
    VerificationTokenRepository tokenRepository;

    public UserService(UserRepository userRepository,ModelMapper modelMapper,VerificationTokenRepository tokenRepository) {
        this.modelMapper=modelMapper;
        this.userRepository = userRepository;
        this.tokenRepository=tokenRepository;
    }

    public UserResponse createOneUser(CreateUserRequest request) {
        User user = convertToUser(request);
        User userCreated =userRepository.save(user);
        return convertUsersToUserResponse(userCreated);
    }

    public List<UserResponse> getAllUsers() {

        List<User> userList = userRepository.findAll();
        return userList.stream()
                .map(this::convertUsersToUserResponse)
                .toList();
    }
    public void deleteOneUser(UUID userId) {

        // 1. First, verify the loan exists to provide a clean 404 if not.
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot delete. Loan not found with ID: " + userId));

        // 2. Check for and delete the associated Fine (the "child").
        // This is the crucial step that was missing.
        VerificationToken verificationToken  = tokenRepository.findByUser(userToDelete);
        if (verificationToken.isVerified()) {
            tokenRepository.delete(verificationToken);
        }
        // 3. Now that the child is gone, you can safely delete the parent.
        userRepository.delete(userToDelete);
    }

    public UserResponse getOneUserByUsername(String username) {
         User user = userRepository.findByUsername(username);
         return convertUsersToUserResponse(user);
    }

    public UserResponse updateOneUser(UUID userId, UpdateUserRequest request) {
        User userToUpdate = userRepository.findById(userId).orElseThrow();

        if (request.getEmail() != null) {
            userToUpdate.setEmail(request.getEmail());
        }

        if (request.getUsername() != null) {
            userToUpdate.setUsername(request.getUsername());
        }

        if (request.getPassword() != null) {
            userToUpdate.setPassword(request.getPassword());
        }

        if (request.getFirstName() != null) {
            userToUpdate.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            userToUpdate.setLastName(request.getLastName());
        }

        if (request.getRole() != null) {
            userToUpdate.setRole(request.getRole());
        }

        userToUpdate.setActive(request.isActive());
        User user = userRepository.save(userToUpdate);
        return convertUsersToUserResponse(user);
    }
    public UserResponse getOneUser(UUID userId) {
        User user = userRepository.findById(userId).get();
        return convertUsersToUserResponse(user);
    }



    public void markEmailVerified(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }
    public void deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    public User getOneUserByEmail(String email)
    {
        return userRepository.getOneUserByEmail(email);
    }
    private UserResponse convertUsersToUserResponse(User user)
    {
        UserResponse response= new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setActive(user.isActive());
        return response;

    }
    private User convertToUser(CreateUserRequest request)
    {
        User user = new User();
        user.setId(request.getId());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setActive(request.isActive());
        return user;
    }
}

