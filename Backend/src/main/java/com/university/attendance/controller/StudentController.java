package com.university.attendance.controller;

import com.university.attendance.entity.EnrollmentRole;
import com.university.attendance.entity.User;
import com.university.attendance.entity.UserRole;
import com.university.attendance.repository.UserRepository;
import com.university.attendance.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class StudentController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/courses")
    public ResponseEntity<?> getStudentCourses(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get student user from auth
            Long studentUserId = getStudentUserId(authHeader);
            if (studentUserId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Student authentication required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            return ResponseEntity.ok(courseService.getEnrolledCourses(studentUserId, EnrollmentRole.STUDENT));

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private Long getStudentUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        
        // Simple token validation - in production, implement proper JWT validation
        try {
            // This is a simplified approach. In production, implement proper JWT token validation
            // For now, we'll check if there's a matching user with student role
            // You may need to implement proper JWT token service here
            
            // Get first student user (simplified for demo)
            // In production, extract user ID from JWT token
            Optional<User> studentUser = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.STUDENT)
                    .findFirst();
            
            return studentUser.map(User::getUserID).orElse(null);
            
        } catch (Exception e) {
            return null;
        }
    }
}