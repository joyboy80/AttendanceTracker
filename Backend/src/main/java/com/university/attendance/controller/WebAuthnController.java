package com.university.attendance.controller;

import com.university.attendance.dto.*;
import com.university.attendance.service.WebAuthnService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"})
public class WebAuthnController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebAuthnController.class);
    
    @Autowired
    private WebAuthnService webAuthnService;
    
    /**
     * Get registration options for WebAuthn fingerprint registration
     */
    @PostMapping("/registration-options")
    public ResponseEntity<?> getRegistrationOptions(@RequestBody RegistrationOptionsRequest request) {
        try {
            logger.info("Getting registration options for user ID: {}", request.getUserId());
            RegistrationOptionsResponse response = webAuthnService.startRegistration(request.getUserId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get registration options", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Complete fingerprint registration
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCredential(@RequestBody RegistrationRequest request) {
        try {
            logger.info("Registering credential for user ID: {}", request.getUserId());
            String result = webAuthnService.finishRegistration(request, request.getUserId());
            return ResponseEntity.ok(new SuccessResponse(result));
        } catch (Exception e) {
            logger.error("Failed to register credential", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get authentication options for WebAuthn fingerprint authentication
     */
    @PostMapping("/authentication-options")
    public ResponseEntity<?> getAuthenticationOptions(@RequestBody AuthenticationOptionsRequest request) {
        try {
            logger.info("Getting authentication options for user ID: {}", request.getUserId());
            AuthenticationOptionsResponse response = webAuthnService.startAuthentication(request.getUserId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get authentication options", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Complete fingerprint verification and mark attendance
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyAndMarkAttendance(@RequestBody AuthenticationRequest request) {
        try {
            logger.info("Verifying fingerprint and marking attendance for user ID: {}", request.getUserId());
            String result = webAuthnService.finishAuthentication(request, request.getUserId());
            return ResponseEntity.ok(new SuccessResponse(result));
        } catch (Exception e) {
            logger.error("Failed to verify fingerprint", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Check if user has registered fingerprint
     */
    @GetMapping("/fingerprint-status/{userId}")
    public ResponseEntity<?> getFingerprintStatus(@PathVariable Long userId) {
        try {
            boolean hasFingerprint = webAuthnService.hasRegisteredFingerprint(userId);
            return ResponseEntity.ok(new FingerprintStatusResponse(hasFingerprint));
        } catch (Exception e) {
            logger.error("Failed to get fingerprint status", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Response DTOs
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
    
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    public static class FingerprintStatusResponse {
        private boolean hasFingerprint;
        
        public FingerprintStatusResponse(boolean hasFingerprint) {
            this.hasFingerprint = hasFingerprint;
        }
        
        public boolean isHasFingerprint() {
            return hasFingerprint;
        }
        
        public void setHasFingerprint(boolean hasFingerprint) {
            this.hasFingerprint = hasFingerprint;
        }
    }
}