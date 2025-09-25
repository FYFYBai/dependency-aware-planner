package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.example.demo.entity.ProjectInvitation;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendVerificationEmail(User user, String verificationToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Verify Your Email Address");
        
        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        
        message.setText(
            "Hello " + user.getUsername() + ",\n\n" +
            "Thank you for registering! Please click the link below to verify your email address:\n\n" +
            verificationUrl + "\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you didn't create an account, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Dependency Aware Planner Team"
        );
        
        mailSender.send(message);
    }
    
    public void sendVerificationSuccessEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Email Verified Successfully");
        
        message.setText(
            "Hello " + user.getUsername() + ",\n\n" +
            "Your email has been successfully verified! You can now log in to your account.\n\n" +
            "Best regards,\n" +
            "Dependency Aware Planner Team"
        );
        
        mailSender.send(message);
    }
    
    public void sendProjectInvitationEmail(ProjectInvitation invitation) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(invitation.getInvitedEmail());
        message.setSubject("Project Collaboration Invitation: " + invitation.getProject().getName());
        
        String invitationUrl = frontendUrl + "/invitation/" + invitation.getToken();
        
        message.setText("""
            Hello,
            
            You have been invited to collaborate on the project "%s" by %s.
            
            Project Description: %s
            
            Your role will be: %s
            
            To accept or decline this invitation, please click the link below:
            
            %s
            
            This invitation will expire on %s.
            
            If you don't have an account yet, you'll need to register first before accepting the invitation.
            
            Best regards,
            Dependency Aware Planner Team
            """.formatted(
                invitation.getProject().getName(),
                invitation.getInvitedBy().getUsername(),
                invitation.getProject().getDescription(),
                invitation.getRole(),
                invitationUrl,
                invitation.getExpiresAt()
            ));
        
        mailSender.send(message);
    }
}
