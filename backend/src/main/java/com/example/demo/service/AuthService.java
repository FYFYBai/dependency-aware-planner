package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.EmailVerificationToken;
import com.example.demo.entity.User;
import com.example.demo.repository.EmailVerificationTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailVerificationTokenRepository tokenRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private EmailService emailService;
    
    @Transactional
    public User register(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setIsAdmin(false);
        user.setEmailVerified(false);
        
        user = userRepository.save(user);
        
        // Create verification token
        String verificationToken = UUID.randomUUID().toString();
        EmailVerificationToken token = new EmailVerificationToken(
            verificationToken, 
            user, 
            LocalDateTime.now().plusHours(24)
        );
        tokenRepository.save(token);
        
        // Send verification email
        emailService.sendVerificationEmail(user, verificationToken);
        
        return user;
    }
    
    public String login(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return jwtUtil.generateToken(userDetails);
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public String getUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }
    
    @Transactional
    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new RuntimeException("Verification token has expired");
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        
        // Delete the used token
        tokenRepository.delete(verificationToken);
        
        // Send success email
        emailService.sendVerificationSuccessEmail(user);
        
        return true;
    }
    
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        // Delete existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());
        
        // Create new verification token
        String verificationToken = UUID.randomUUID().toString();
        EmailVerificationToken token = new EmailVerificationToken(
            verificationToken, 
            user, 
            LocalDateTime.now().plusHours(24)
        );
        tokenRepository.save(token);
        
        // Send verification email
        emailService.sendVerificationEmail(user, verificationToken);
    }
}
