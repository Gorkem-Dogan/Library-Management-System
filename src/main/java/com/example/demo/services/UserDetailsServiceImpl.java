package com.example.demo.services;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.demo.entities.User;
import com.example.demo.repos.UserRepository;
import com.example.demo.security.JwtUserDetails;
import java.util.UUID;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user==null){
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return JwtUserDetails.create(user);
    }

    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("user has not found with the id" + id) );
        return JwtUserDetails.create(user);
    }


    }
