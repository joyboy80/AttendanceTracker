package com.university.attendance.controller;

import com.university.attendance.entity.EnrollmentRole;
import com.university.attendance.entity.User;
import com.university.attendance.entity.UserRole;
import com.university.attendance.repository.UserRepository;
import com.university.attendance.service.CourseService;
import com.university.attendance.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class TeacherController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/courses")
    public ResponseEntity<?> getTeacherCourses(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get teacher user from auth
            Long teacherUserId = getTeacherUserId(authHeader);
            if (teacherUserId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Teacher authentication required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            return ResponseEntity.ok(courseService.getEnrolledCourses(teacherUserId, EnrollmentRole.TEACHER));

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private Long getTeacherUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        
        try {
            // Validate the JWT token
            if (!jwtUtil.validateToken(token)) {
                return null;
            }
            
            // Extract username from token
            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                return null;
            }
            
            // Find the user by username and verify they are a teacher
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getRole() == UserRole.TEACHER) {
                    return user.getUserID();
                }
            }
            
            return null;
            
        } catch (Exception e) {
            return null;
        }
    }
}