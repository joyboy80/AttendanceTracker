package com.university.attendance.controller;

import com.university.attendance.dto.RoutineResponse;
import com.university.attendance.entity.*;
import com.university.attendance.repository.*;
import com.university.attendance.service.CourseService;
import com.university.attendance.util.JwtUtil;
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
@RequestMapping("/api/teacher")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class TeacherController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoutineRepository routineRepository;

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

    @GetMapping("/routines")
    public ResponseEntity<?> getTeacherRoutines(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get teacher user from auth
            Long teacherUserId = getTeacherUserId(authHeader);
            if (teacherUserId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Access denied. Teacher authentication required."));
            }

            List<Routine> routines = routineRepository.findRoutinesWithDetailsForTeacher(teacherUserId);
            
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
                "routines", responses
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error fetching routines: " + e.getMessage()));
        }
    }

    @GetMapping("/routines/today")
    public ResponseEntity<?> getTodayRoutines(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get teacher user from auth
            Long teacherUserId = getTeacherUserId(authHeader);
            if (teacherUserId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Access denied. Teacher authentication required."));
            }

            // Get today's day name
            String today = java.time.LocalDate.now().getDayOfWeek().name();
            String dayName = today.charAt(0) + today.substring(1).toLowerCase(); // Convert to proper case

            List<Routine> routines = routineRepository.findByTeacher_UserIDAndDay(teacherUserId, dayName);
            
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
                "day", dayName
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error fetching today's routines: " + e.getMessage()));
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