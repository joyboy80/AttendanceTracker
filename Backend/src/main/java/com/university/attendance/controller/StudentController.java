package com.university.attendance.controller;

import com.university.attendance.dto.RoutineResponse;
import com.university.attendance.entity.*;
import com.university.attendance.repository.*;
import com.university.attendance.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class StudentController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoutineRepository routineRepository;

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

    @GetMapping("/routines")
    public ResponseEntity<?> getStudentRoutines(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get student batch from auth
            String studentBatch = getStudentBatch(authHeader);
            if (studentBatch == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Access denied. Student authentication required."));
            }

            List<Routine> routines = routineRepository.findRoutinesWithDetailsForBatch(studentBatch);
            
            List<RoutineResponse> responses = routines.stream()
                .map(routine -> new RoutineResponse(
                    routine.getRoutineID(),
                    routine.getCourse().getId(),
                    routine.getCourse().getCode(),
                    routine.getCourse().getTitle(),
                    routine.getCourseTime(),
                    routine.getEndTime(),
                    routine.getDay(),
                    routine.getTeacher().getUserID(),
                    routine.getTeacher().getName(),
                    routine.getTeacher().getUsername(),
                    routine.getStudentBatch(),
                    routine.getCreatedAt()
                ))
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "routines", responses,
                "batch", studentBatch
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error fetching routines: " + e.getMessage()));
        }
    }

    @GetMapping("/routines/today")
    public ResponseEntity<?> getTodayRoutines(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get student batch from auth
            String studentBatch = getStudentBatch(authHeader);
            if (studentBatch == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Access denied. Student authentication required."));
            }

            // Get today's day name
            String today = java.time.LocalDate.now().getDayOfWeek().name();
            String dayName = today.charAt(0) + today.substring(1).toLowerCase(); // Convert to proper case

            List<Routine> routines = routineRepository.findByStudentBatchAndDay(studentBatch, dayName);
            
            List<RoutineResponse> responses = routines.stream()
                .map(routine -> new RoutineResponse(
                    routine.getRoutineID(),
                    routine.getCourse().getId(),
                    routine.getCourse().getCode(),
                    routine.getCourse().getTitle(),
                    routine.getCourseTime(),
                    routine.getEndTime(),
                    routine.getDay(),
                    routine.getTeacher().getUserID(),
                    routine.getTeacher().getName(),
                    routine.getTeacher().getUsername(),
                    routine.getStudentBatch(),
                    routine.getCreatedAt()
                ))
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "routines", responses,
                "day", dayName,
                "batch", studentBatch
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error fetching today's routines: " + e.getMessage()));
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

    private String getStudentBatch(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        
        // Simple token validation - in production, implement proper JWT validation
        try {
            // This is a simplified approach. In production, implement proper JWT token validation
            // For now, we'll get the batch of the first student user
            // You may need to implement proper JWT token service here
            
            // Get first student user (simplified for demo)
            // In production, extract user info from JWT token
            Optional<User> studentUser = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.STUDENT)
                    .findFirst();
            
            return studentUser.map(User::getBatch).orElse(null);
            
        } catch (Exception e) {
            return null;
        }
    }
}