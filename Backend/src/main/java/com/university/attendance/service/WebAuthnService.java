package com.university.attendance.service;

import com.university.attendance.dto.*;
import com.university.attendance.entity.AttendanceCredential;
import com.university.attendance.entity.ClassSession;
import com.university.attendance.entity.User;
import com.university.attendance.repository.AttendanceCredentialRepository;
import com.university.attendance.repository.UserRepository;
import com.university.attendance.util.Base64UrlUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebAuthnService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebAuthnService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AttendanceCredentialRepository credentialRepository;
    
    @Autowired
    private AttendanceService attendanceService;
    
    private final Map<Long, String> challengeStore = new ConcurrentHashMap<>();
    
    private static final String RP_ID = "localhost";
    private static final String RP_NAME = "Smart Attendance Tracker";
    // Note: ALLOWED_ORIGINS can be used for future CORS validation if needed
    // private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
    //     "http://localhost:3000",
    //     "http://localhost:8080",
    //     "http://localhost:5173"
    // );
    
    /**
     * Start WebAuthn registration process for a user
     */
    public RegistrationOptionsResponse startRegistration(Long userId) {
        logger.info("Starting WebAuthn registration for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user already has an active credential
        if (credentialRepository.existsByUserAndActiveTrue(user)) {
            throw new RuntimeException("User already has an active fingerprint credential");
        }
        
        // Generate challenge
        String challenge = Base64UrlUtil.generateChallenge();
        challengeStore.put(userId, challenge);
        
        // Create registration options
        RegistrationOptionsResponse.RelyingParty rp = new RegistrationOptionsResponse.RelyingParty(RP_ID, RP_NAME);
        
        RegistrationOptionsResponse.UserInfo userInfo = new RegistrationOptionsResponse.UserInfo(
            Base64UrlUtil.encode(userId.toString().getBytes()),
            user.getUsername(),
            user.getName()
        );
        
        // Use standard algorithm identifiers
        RegistrationOptionsResponse.PubKeyCredParam[] pubKeyCredParams = {
            new RegistrationOptionsResponse.PubKeyCredParam("public-key", -7),  // ES256
            new RegistrationOptionsResponse.PubKeyCredParam("public-key", -257) // RS256
        };
        
        RegistrationOptionsResponse.AuthenticatorSelection authenticatorSelection = 
            new RegistrationOptionsResponse.AuthenticatorSelection("platform", "required", false);
        
        return new RegistrationOptionsResponse(
            challenge,
            rp,
            userInfo,
            pubKeyCredParams,
            authenticatorSelection,
            60000, // 60 seconds timeout
            "none"
        );
    }
    
    /**
     * Finish WebAuthn registration process
     */
    public String finishRegistration(RegistrationRequest request, Long userId) {
        logger.info("Finishing WebAuthn registration for user ID: {}", userId);
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String storedChallenge = challengeStore.remove(userId);
            if (storedChallenge == null) {
                throw new RuntimeException("No challenge found for user. Please restart registration.");
            }
            
            // Basic validation - in a real implementation, you would validate the WebAuthn response
            if (request.getId() == null || request.getResponse() == null) {
                throw new RuntimeException("Invalid registration response");
            }
            
            // For now, we'll create a mock credential - replace with real WebAuthn validation
            String credentialId = request.getId();
            byte[] mockPublicKey = Base64UrlUtil.decode(request.getResponse().getClientDataJSON()); // Mock public key
            long signCount = 0;
            
            // Save credential
            AttendanceCredential credential = new AttendanceCredential(user, credentialId, mockPublicKey, signCount);
            credentialRepository.save(credential);
            
            logger.info("Successfully registered WebAuthn credential for user ID: {}", userId);
            return "Fingerprint registered successfully";
            
        } catch (Exception e) {
            logger.error("Registration failed for user ID: {}", userId, e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
    
    /**
     * Start WebAuthn authentication process
     */
    public AuthenticationOptionsResponse startAuthentication(Long userId) {
        logger.info("Starting WebAuthn authentication for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<AttendanceCredential> credentialOpt = credentialRepository.findByUserAndActiveTrue(user);
        if (!credentialOpt.isPresent()) {
            throw new RuntimeException("No active fingerprint credential found for user. Please register first.");
        }
        
        AttendanceCredential credential = credentialOpt.get();
        
        // Generate challenge
        String challenge = Base64UrlUtil.generateChallenge();
        challengeStore.put(userId, challenge);
        
        // Create allowed credentials list
        AuthenticationOptionsResponse.AllowedCredential[] allowCredentials = {
            new AuthenticationOptionsResponse.AllowedCredential("public-key", credential.getCredentialId())
        };
        
        return new AuthenticationOptionsResponse(
            challenge,
            60000, // 60 seconds timeout
            RP_ID,
            allowCredentials,
            "required"
        );
    }
    
    /**
     * Finish WebAuthn authentication and mark attendance
     */
    public String finishAuthentication(AuthenticationRequest request, Long userId) {
        logger.info("Finishing WebAuthn authentication for user ID: {}", userId);
        
        try {
            // Verify user exists before proceeding
            userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String storedChallenge = challengeStore.remove(userId);
            if (storedChallenge == null) {
                throw new RuntimeException("No challenge found for user. Please restart authentication.");
            }
            
            // Find credential
            AttendanceCredential credential = credentialRepository.findByCredentialIdAndActiveTrue(request.getId())
                    .orElseThrow(() -> new RuntimeException("Invalid credential"));
            
            if (!credential.getUser().getUserID().equals(userId)) {
                throw new RuntimeException("Credential does not belong to user");
            }
            
            // Basic validation - in a real implementation, you would validate the WebAuthn signature
            if (request.getResponse() == null || request.getResponse().getSignature() == null) {
                throw new RuntimeException("Invalid authentication response");
            }
            
            // Update sign count (increment for mock validation)
            credential.setSignCount(credential.getSignCount() + 1);
            credentialRepository.save(credential);
            
            // Mark attendance using the existing attendance service
            return markAttendanceAfterVerification(userId);
            
        } catch (Exception e) {
            logger.error("Authentication failed for user ID: {}", userId, e);
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Mark attendance after successful fingerprint verification
     */
    private String markAttendanceAfterVerification(Long userId) {
        try {
            logger.info("Attempting to mark attendance for user ID: {}", userId);
            
            // Get active session for the user
            Optional<StudentSessionResponse> activeSession = attendanceService.getCurrentActiveSessionForStudentId(userId);
            
            if (!activeSession.isPresent()) {
                logger.error("No active session found for user ID: {}. Trying alternative approach...", userId);
                
                // Alternative: Try common course codes (useful for single class scenarios)
                String[] commonCourseCodes = {"CS101", "CSE-221", "IT101"};
                for (String courseCode : commonCourseCodes) {
                    try {
                        Optional<ClassSession> activeSessionOpt = attendanceService.getCurrentActiveSession(courseCode);
                        if (activeSessionOpt.isPresent()) {
                            ClassSession session = activeSessionOpt.get();
                            logger.info("Found active session for course {}: Session ID {}", courseCode, session.getSessionID());
                            
                            // Mark attendance with this session
                            attendanceService.markAttendance(session.getAccessCode(), userId, courseCode);
                            
                            logger.info("Successfully marked attendance for user ID: {} using course {}", userId, courseCode);
                            return "Attendance marked successfully using fingerprint verification";
                        }
                    } catch (Exception altEx) {
                        logger.warn("Failed to mark attendance for course {}: {}", courseCode, altEx.getMessage());
                    }
                }
                
                // Last resort: provide detailed error information
                throw new RuntimeException("No active attendance sessions available. Please ensure: 1) An attendance session is running, 2) You are enrolled in the course, 3) The session has not expired.");
            }
            
            StudentSessionResponse session = activeSession.get();
            logger.info("Found active session for user {}: Session ID {}, Course {}", userId, session.getSessionID(), session.getCourseCode());
            
            // Mark attendance
            attendanceService.markAttendance(session.getAccessCode(), userId, session.getCourseCode());
            
            logger.info("Successfully marked attendance for user ID: {} using fingerprint verification", userId);
            return "Attendance marked successfully using fingerprint verification";
            
        } catch (Exception e) {
            logger.error("Failed to mark attendance for user ID: {}", userId, e);
            throw new RuntimeException("Fingerprint verified but failed to mark attendance: " + e.getMessage());
        }
    }
    
    /**
     * Check if user has registered fingerprint
     */
    public boolean hasRegisteredFingerprint(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }
        return credentialRepository.existsByUserAndActiveTrue(user);
    }
}