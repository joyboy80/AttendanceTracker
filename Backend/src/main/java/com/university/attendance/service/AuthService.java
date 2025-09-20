package com.university.attendance.service;

import com.university.attendance.dto.AuthResponse;
import com.university.attendance.dto.LoginRequest;
import com.university.attendance.dto.SignupRequest;
import com.university.attendance.entity.Student;
import com.university.attendance.entity.Teacher;
import com.university.attendance.entity.User;
import com.university.attendance.entity.UserRole;
import com.university.attendance.repository.StudentRepository;
import com.university.attendance.repository.TeacherRepository;
import com.university.attendance.repository.UserRepository;
import com.university.attendance.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${admin.signup.secret:}")
    private String adminSignupSecret;
    
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);
        
        return new AuthResponse(token, user);
    }
    
    public AuthResponse signup(SignupRequest signupRequest) {
        // Validate passwords match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        
        // Check if email already exists (if provided)
        if (signupRequest.getEmail() != null && !signupRequest.getEmail().isEmpty()) {
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                throw new RuntimeException("Email is already in use");
            }
        }
        
        // Create user based on role
        User user;
        if (signupRequest.getRole() == UserRole.STUDENT) {
            user = createStudent(signupRequest);
        } else if (signupRequest.getRole() == UserRole.TEACHER) {
            user = createTeacher(signupRequest);
        } else if (signupRequest.getRole() == UserRole.ADMIN) {
            validateAdminSecret(signupRequest);
            user = createAdmin(signupRequest);
        } else {
            throw new RuntimeException("Invalid role specified");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user);
        
        return new AuthResponse(token, user);
    }
    
    private Student createStudent(SignupRequest request) {
        Student student = new Student(
            request.getFirstName(),
            request.getMiddleName(),
            request.getLastName(),
            request.getEmail(),
            request.getPhone(),
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getDepartment(),
            request.getBatch(),
            request.getSection(),
            null // photo
        );
        
        return studentRepository.save(student);
    }
    
    private Teacher createTeacher(SignupRequest request) {
        Teacher teacher = new Teacher(
            request.getFirstName(),
            request.getMiddleName(),
            request.getLastName(),
            request.getEmail(),
            request.getPhone(),
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getDepartment(),
            request.getDesignation(),
            null, // photo
            request.getBatch() // Teachers may not have batch, could be null
        );
        
        return teacherRepository.save(teacher);
    }
    
    private User createAdmin(SignupRequest request) {
        User admin = new User(
            request.getFirstName(),
            request.getMiddleName(),
            request.getLastName(),
            request.getEmail(),
            request.getPhone(),
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            UserRole.ADMIN,
            request.getBatch() // Admin may not have batch, could be null
        );
        return userRepository.save(admin);
    }

    private void validateAdminSecret(SignupRequest request) {
        String expected = adminSignupSecret;
        if (expected == null || expected.isBlank()) {
            expected = System.getenv("ADMIN_SIGNUP_SECRET");
        }
        if (expected == null || expected.isBlank()) {
            throw new RuntimeException("Admin signup is not configured. Contact system administrator.");
        }
        String provided = request.getAdminSecret();
        if (provided == null || !provided.equals(expected)) {
            throw new RuntimeException("Invalid admin secret");
        }
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
