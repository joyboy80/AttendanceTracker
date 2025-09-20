package com.university.attendance.controller;

import com.university.attendance.dto.*;
import com.university.attendance.entity.User;
import com.university.attendance.entity.UserRole;
import com.university.attendance.repository.UserRepository;
import com.university.attendance.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AdminController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/course")
    public ResponseEntity<?> createCourse(@Valid @RequestBody CreateCourseRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role
            if (!isAdminUser(authHeader)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            CourseResponse response = courseService.createCourse(request);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/course/{courseId}/assign")
    public ResponseEntity<?> assignCourse(@PathVariable Long courseId,
                                        @Valid @RequestBody AssignCourseRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role and get admin user
            Long adminUserId = getAdminUserId(authHeader);
            if (adminUserId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            AssignCourseResponse response = courseService.assignCourse(courseId, request, adminUserId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/course/{courseId}/assign/students")
    public ResponseEntity<?> assignCourseToBatch(@PathVariable Long courseId,
                                               @Valid @RequestBody BatchAssignRequest request,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role and get admin user
            Long adminUserId = getAdminUserId(authHeader);
            if (adminUserId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            AssignCourseResponse response = courseService.assignCourseToBatch(courseId, request.getBatch(), adminUserId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/course/{courseId}/assign/teacher")
    public ResponseEntity<?> assignCourseToTeacher(@PathVariable Long courseId,
                                                 @Valid @RequestBody AssignCourseRequest request,
                                                 @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role and get admin user
            Long adminUserId = getAdminUserId(authHeader);
            if (adminUserId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            AssignCourseResponse response = courseService.assignCourse(courseId, request, adminUserId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getAllCourses(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role
            if (!isAdminUser(authHeader)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            return ResponseEntity.ok(courseService.getAllCourses());

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private boolean isAdminUser(String authHeader) {
        return getAdminUserId(authHeader) != null;
    }

    private Long getAdminUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        
        // Simple token validation - in production, implement proper JWT validation
        // For now, decode the basic user info from localStorage pattern
        try {
            // This is a simplified approach. In production, implement proper JWT token validation
            // For now, we'll check if there's a matching user with admin role
            // You may need to implement proper JWT token service here
            
            // Get all users and find admin user (simplified for demo)
            // In production, implement proper token validation service
            Optional<User> adminUser = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.ADMIN)
                    .findFirst();
            
            return adminUser.map(User::getUserID).orElse(null);
            
        } catch (Exception e) {
            return null;
        }
    }
}