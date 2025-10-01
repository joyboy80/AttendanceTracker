package com.university.attendance.controller;

import com.university.attendance.dto.*;
import com.university.attendance.entity.*;
import com.university.attendance.repository.*;
import com.university.attendance.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AdminController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

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

    @GetMapping("/courses/teacher/{teacherId}")
    public ResponseEntity<?> getCoursesByTeacher(@PathVariable Long teacherId,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role
            if (!isAdminUser(authHeader)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // Check if teacher exists
            Optional<Teacher> teacher = teacherRepository.findById(teacherId);
            if (teacher.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Teacher not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            List<CourseResponse> courses = courseService.getEnrolledCourses(teacherId, EnrollmentRole.TEACHER);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("teacherId", teacherId);
            response.put("teacherName", teacher.get().getName());
            response.put("courses", courses);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/student-batches")
    public ResponseEntity<?> getStudentBatches(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role
            if (!isAdminUser(authHeader)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // Get all distinct batches from students
            List<String> batches = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.STUDENT)
                    .map(User::getBatch)
                    .filter(batch -> batch != null && !batch.trim().isEmpty())
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("batches", batches);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/teachers")
    public ResponseEntity<?> getAllTeachers(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role
            if (!isAdminUser(authHeader)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // Get all teachers
            List<Map<String, Object>> teachers = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.TEACHER)
                    .map(user -> {
                        Map<String, Object> teacherInfo = new HashMap<>();
                        teacherInfo.put("id", user.getUserID());
                        teacherInfo.put("username", user.getUsername());
                        teacherInfo.put("name", user.getName());
                        teacherInfo.put("email", user.getEmail());
                        return teacherInfo;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("teachers", teachers);
            return ResponseEntity.ok(response);

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

    // Routine Management Endpoints

    @PostMapping("/routine")
    public ResponseEntity<?> createRoutine(@Valid @RequestBody CreateRoutineRequest request) {
        try {
            // Validate that course exists
            Optional<Course> course = courseRepository.findById(request.getCourseId());
            if (course.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Course not found"));
            }

            // Validate that teacher exists by username and retrieve TeacherID
            Optional<Teacher> teacher = teacherRepository.findByUsername(request.getUsername());
            if (teacher.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Teacher with username '" + request.getUsername() + "' not found"));
            }

            // Validate that StudentBatch exists
            if (!studentRepository.existsByBatch(request.getStudentBatch())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Student batch '" + request.getStudentBatch() + "' not found"));
            }

            // Parse course time and end time
            LocalTime courseTime;
            LocalTime endTime;
            try {
                courseTime = LocalTime.parse(request.getCourseTime());
                endTime = LocalTime.parse(request.getEndTime());
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid time format. Use HH:MM (e.g., 09:00, 14:30)"));
            }

            // Validate that endTime is after courseTime
            if (!endTime.isAfter(courseTime)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "End time must be after start time"));
            }

            // Check for duplicate routine
            if (routineRepository.existsByCourse_IdAndDayAndCourseTimeAndStudentBatch(
                    request.getCourseId(), request.getDay(), courseTime, request.getStudentBatch())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Routine already exists for this course, day, time and batch"));
            }

            // Create routine
            Routine routine = new Routine(course.get(), courseTime, endTime, request.getDay(), 
                                        teacher.get(), request.getStudentBatch());
            routine = routineRepository.save(routine);

            // Create response
            RoutineResponse response = new RoutineResponse(
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
            );

            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Routine created successfully", 
                "routine", response
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error creating routine: " + e.getMessage()));
        }
    }

    @GetMapping("/routines")
    public ResponseEntity<?> getAllRoutines() {
        try {
            List<Routine> routines = routineRepository.findAllWithDetails();
            
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

    @DeleteMapping("/routine/{id}")
    public ResponseEntity<?> deleteRoutine(@PathVariable Long id) {
        try {
            if (!routineRepository.existsById(id)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Routine not found"));
            }

            routineRepository.deleteById(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Routine deleted successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error deleting routine: " + e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        try {
            List<User> allStudents = userRepository.findByRole(UserRole.STUDENT);
            List<Map<String, Object>> studentsList = allStudents.stream()
                .map(user -> {
                    Map<String, Object> studentInfo = new HashMap<>();
                    studentInfo.put("id", user.getUserID());
                    studentInfo.put("name", user.getName());
                    studentInfo.put("username", user.getUsername());
                    studentInfo.put("batch", user.getBatch());
                    studentInfo.put("email", user.getEmail());
                    studentInfo.put("hasBatch", user.getBatch() != null && !user.getBatch().isEmpty());
                    return studentInfo;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Students retrieved successfully",
                "students", studentsList,
                "total", studentsList.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error retrieving students: " + e.getMessage()));
        }
    }

    @PutMapping("/student/{studentId}/batch")
    public ResponseEntity<?> updateStudentBatch(@PathVariable Long studentId, @RequestBody Map<String, String> request) {
        try {
            String newBatch = request.get("batch");
            if (newBatch == null || newBatch.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Batch cannot be empty"));
            }

            Optional<User> userOpt = userRepository.findById(studentId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Student not found"));
            }

            User student = userOpt.get();
            if (student.getRole() != UserRole.STUDENT) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User is not a student"));
            }

            student.setBatch(newBatch.trim());
            userRepository.save(student);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student batch updated successfully",
                "studentId", studentId,
                "newBatch", newBatch.trim()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error updating student batch: " + e.getMessage()));
        }
    }

    @PostMapping("/students/assign-default-batches")
    public ResponseEntity<?> assignDefaultBatches() {
        try {
            List<User> studentsWithoutBatch = userRepository.findByRole(UserRole.STUDENT)
                .stream()
                .filter(user -> user.getBatch() == null || user.getBatch().trim().isEmpty())
                .collect(Collectors.toList());

            if (studentsWithoutBatch.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "All students already have batches assigned",
                    "updated", 0
                ));
            }

            int updated = 0;
            String defaultBatch = "21"; // Default batch assignment

            for (User student : studentsWithoutBatch) {
                student.setBatch(defaultBatch);
                userRepository.save(student);
                updated++;
                System.out.println("Assigned batch " + defaultBatch + " to student: " + student.getName() + " (ID: " + student.getUserID() + ")");
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully assigned default batch to " + updated + " students",
                "updated", updated,
                "defaultBatch", defaultBatch
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error assigning default batches: " + e.getMessage()));
        }
    }
}