package com.university.attendance.controller;

import com.university.attendance.dto.*;
import com.university.attendance.entity.*;
import com.university.attendance.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class RoutineController {

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/routine")
    public ResponseEntity<?> createRoutine(@Valid @RequestBody CreateRoutineRequest request) {
        try {
            // Validate that CourseID exists in Course table
            Optional<Course> course = courseRepository.findById(request.getCourseId());
            if (course.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "CourseID not found in Course table"));
            }

            // Validate that Username exists in Teacher table and retrieve TeacherID
            Optional<Teacher> teacher = teacherRepository.findByUsername(request.getUsername());
            if (teacher.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Username '" + request.getUsername() + "' not found in Teacher table"));
            }

            // Validate that StudentBatch exists in Student table
            if (!studentRepository.existsByBatch(request.getStudentBatch())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "StudentBatch '" + request.getStudentBatch() + "' not found in Student table"));
            }

            // Parse CourseTime and EndTime
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

            // Check for duplicate routine (same course, day, time, and batch)
            if (routineRepository.existsByCourse_IdAndDayAndCourseTimeAndStudentBatch(
                    request.getCourseId(), request.getDay(), courseTime, request.getStudentBatch())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Routine already exists for this CourseID, Day, CourseTime and StudentBatch combination"));
            }

            // Create and save routine
            Routine routine = new Routine(course.get(), courseTime, endTime, request.getDay(), 
                                        teacher.get(), request.getStudentBatch());
            routine = routineRepository.save(routine);

            // Create response with the inserted routine details
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

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Routine created successfully");
            result.put("routine", response);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error creating routine: " + e.getMessage()));
        }
    }

    // Student info API endpoint as per requirements: /student/:id should return batch_id
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentInfo(@PathVariable Long studentId) {
        try {
            System.out.println("Fetching student info for ID: " + studentId); // Debug log
            
            // Check if the user exists and is a student
            Optional<User> userOpt = userRepository.findById(studentId);
            if (userOpt.isEmpty()) {
                System.out.println("User with ID " + studentId + " not found"); // Debug log
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User with ID " + studentId + " not found"));
            }
            
            User user = userOpt.get();
            if (user.getRole() != UserRole.STUDENT) {
                System.out.println("User with ID " + studentId + " is not a student, role: " + user.getRole()); // Debug log
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User with ID " + studentId + " is not a student"));
            }
            
            // Get batch from Student table first, then fallback to User table
            String studentBatch = null;
            String batchSource = null;
            
            // Check Student table first (most reliable)
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isPresent() && studentOpt.get().getBatch() != null && !studentOpt.get().getBatch().trim().isEmpty()) {
                studentBatch = studentOpt.get().getBatch();
                batchSource = "Student table";
                System.out.println("Found batch in Student table: " + studentBatch); // Debug log
            }
            
            // Fallback to User table if Student table doesn't have batch
            if (studentBatch == null || studentBatch.trim().isEmpty()) {
                studentBatch = user.getBatch();
                batchSource = "User table";
                System.out.println("Fallback to User table batch: " + studentBatch); // Debug log
            }
            
            boolean hasBatch = studentBatch != null && !studentBatch.trim().isEmpty();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Student info retrieved successfully");
            response.put("studentId", studentId);
            response.put("studentName", user.getName());
            response.put("studentUsername", user.getUsername());
            response.put("studentEmail", user.getEmail());
            response.put("batch_id", hasBatch ? studentBatch : null); // As per requirements
            response.put("batchId", hasBatch ? studentBatch : null);  // Alternative field name
            response.put("hasBatch", hasBatch);
            response.put("batchSource", batchSource);
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace for debugging
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error retrieving student info: " + errorMessage));
        }
    }

    @GetMapping("/routine/student/{studentId}")
    public ResponseEntity<?> getStudentRoutine(@PathVariable Long studentId) {
        try {
            System.out.println("Fetching routine for student ID: " + studentId); // Debug log
            
            // First check if the user exists and is a student
            Optional<User> userOpt = userRepository.findById(studentId);
            if (userOpt.isEmpty()) {
                System.out.println("User with ID " + studentId + " not found"); // Debug log
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User with ID " + studentId + " not found"));
            }
            
            User user = userOpt.get();
            if (user.getRole() != UserRole.STUDENT) {
                System.out.println("User with ID " + studentId + " is not a student, role: " + user.getRole()); // Debug log
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User with ID " + studentId + " is not a student"));
            }
            
            // Try to get batch from Student table first, then fallback to User table
            String studentBatch = null;
            
            // Check Student table first (most reliable)
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isPresent()) {
                studentBatch = studentOpt.get().getBatch();
                System.out.println("Found batch in Student table: " + studentBatch); // Debug log
            }
            
            // Fallback to User table if Student table doesn't have batch
            if (studentBatch == null || studentBatch.trim().isEmpty()) {
                studentBatch = user.getBatch();
                System.out.println("Fallback to User table batch: " + studentBatch); // Debug log
            }
            
            if (studentBatch == null || studentBatch.trim().isEmpty()) {
                System.out.println("Student has no batch assigned in either table"); // Debug log
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, 
                                "message", "Student has no batch assigned. Please contact your administrator to assign you to a batch.",
                                "action", "MISSING_BATCH",
                                "studentId", studentId));
            }

            // Query Routine table where StudentBatch = student.Batch
            List<Routine> routines = routineRepository.findRoutinesWithDetailsForBatch(studentBatch);
            System.out.println("Found " + routines.size() + " routines for batch " + studentBatch); // Debug log

            // Convert to response format (Day, CourseTime, EndTime, CourseTitle, TeacherName)
            List<Map<String, Object>> weeklySchedule = routines.stream()
                .map(routine -> {
                    Map<String, Object> scheduleItem = new java.util.HashMap<>();
                    scheduleItem.put("day", routine.getDay());
                    scheduleItem.put("courseTime", routine.getCourseTime().toString());
                    scheduleItem.put("endTime", routine.getEndTime().toString());
                    scheduleItem.put("courseTitle", routine.getCourse().getTitle());
                    scheduleItem.put("courseCode", routine.getCourse().getCode());
                    scheduleItem.put("teacherName", routine.getTeacher().getName());
                    scheduleItem.put("routineId", routine.getRoutineID());
                    scheduleItem.put("studentBatch", routine.getStudentBatch());
                    scheduleItem.put("createdAt", routine.getCreatedAt());
                    
                    // Add day order for proper sorting on frontend
                    String[] dayOrder = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
                    for (int i = 0; i < dayOrder.length; i++) {
                        if (dayOrder[i].equals(routine.getDay())) {
                            scheduleItem.put("dayOrder", i);
                            break;
                        }
                    }
                    
                    return scheduleItem;
                })
                .collect(java.util.stream.Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Student routine retrieved successfully");
            result.put("studentId", studentId);
            result.put("studentBatch", studentBatch);
            result.put("weeklySchedule", weeklySchedule);
            result.put("totalRoutines", weeklySchedule.size());
            result.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace for debugging
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error retrieving student routine: " + errorMessage));
        }
    }

    // Alternative routine fetch API as per requirements: /routine?batchId=<batch_id>
    @GetMapping("/routine")
    public ResponseEntity<?> getRoutinesByBatch(@RequestParam String batchId) {
        try {
            System.out.println("Fetching routines for batch: " + batchId); // Debug log
            
            if (batchId == null || batchId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Batch ID is required"));
            }
            
            // Query Routine table where StudentBatch = batchId
            List<Routine> routines = routineRepository.findRoutinesWithDetailsForBatch(batchId.trim());
            System.out.println("Found " + routines.size() + " routines for batch " + batchId); // Debug log

            // Convert to response format
            List<Map<String, Object>> weeklySchedule = routines.stream()
                .map(routine -> {
                    Map<String, Object> scheduleItem = new java.util.HashMap<>();
                    scheduleItem.put("day", routine.getDay());
                    scheduleItem.put("courseTime", routine.getCourseTime().toString());
                    scheduleItem.put("endTime", routine.getEndTime().toString());
                    scheduleItem.put("courseTitle", routine.getCourse().getTitle());
                    scheduleItem.put("courseCode", routine.getCourse().getCode());
                    scheduleItem.put("teacherName", routine.getTeacher().getName());
                    scheduleItem.put("routineId", routine.getRoutineID());
                    scheduleItem.put("studentBatch", routine.getStudentBatch());
                    scheduleItem.put("createdAt", routine.getCreatedAt());
                    
                    // Add day order for proper sorting on frontend
                    String[] dayOrder = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
                    for (int i = 0; i < dayOrder.length; i++) {
                        if (dayOrder[i].equals(routine.getDay())) {
                            scheduleItem.put("dayOrder", i);
                            break;
                        }
                    }
                    
                    return scheduleItem;
                })
                .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Routines retrieved successfully");
            response.put("batchId", batchId.trim());
            response.put("weeklySchedule", weeklySchedule);
            response.put("totalRoutines", weeklySchedule.size());
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace for debugging
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error retrieving routines: " + errorMessage));
        }
    }

    @GetMapping("/routine/teacher/{teacherId}")
    public ResponseEntity<?> getTeacherRoutine(@PathVariable Long teacherId) {
        try {
            // Validate that teacher exists
            Optional<Teacher> teacher = teacherRepository.findById(teacherId);
            if (teacher.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Teacher with ID " + teacherId + " not found"));
            }

            // Query Routine table where TeacherID = teacherId
            List<Routine> routines = routineRepository.findRoutinesWithDetailsForTeacher(teacherId);

            // Convert to response format (Day, CourseTime, EndTime, CourseTitle, StudentBatch)
            List<Map<String, Object>> weeklySchedule = routines.stream()
                .map(routine -> {
                    Map<String, Object> scheduleItem = new java.util.HashMap<>();
                    scheduleItem.put("day", routine.getDay());
                    scheduleItem.put("courseTime", routine.getCourseTime().toString());
                    scheduleItem.put("endTime", routine.getEndTime().toString());
                    scheduleItem.put("courseTitle", routine.getCourse().getTitle());
                    scheduleItem.put("studentBatch", routine.getStudentBatch());
                    scheduleItem.put("courseCode", routine.getCourse().getCode());
                    scheduleItem.put("routineId", routine.getRoutineID());
                    scheduleItem.put("teacherName", routine.getTeacher().getName());
                    return scheduleItem;
                })
                .collect(java.util.stream.Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Teacher routine retrieved successfully");
            result.put("teacherId", teacherId);
            result.put("teacherName", teacher.get().getName());
            result.put("teacherUsername", teacher.get().getUsername());
            result.put("weeklySchedule", weeklySchedule);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error retrieving teacher routine: " + e.getMessage()));
        }
    }

    // Debug endpoint to check if a user exists as a student
    @GetMapping("/debug/user/{userId}")
    public ResponseEntity<?> debugUser(@PathVariable Long userId) {
        try {
            Optional<User> user = userRepository.findById(userId);
            Optional<Student> student = studentRepository.findById(userId);
            
            Map<String, Object> debug = new HashMap<>();
            debug.put("userExists", user.isPresent());
            debug.put("studentExists", student.isPresent());
            
            if (user.isPresent()) {
                debug.put("userRole", user.get().getRole());
                debug.put("userBatch", user.get().getBatch());
                debug.put("userName", user.get().getName());
                debug.put("userUsername", user.get().getUsername());
            }
            
            if (student.isPresent()) {
                debug.put("studentBatch", student.get().getBatch());
                debug.put("studentDepartment", student.get().getDepartment());
                debug.put("studentSection", student.get().getSection());
            }
            
            // Check which batch would be used
            String effectiveBatch = null;
            if (student.isPresent() && student.get().getBatch() != null && !student.get().getBatch().trim().isEmpty()) {
                effectiveBatch = student.get().getBatch();
                debug.put("batchSource", "Student table");
            } else if (user.isPresent() && user.get().getBatch() != null && !user.get().getBatch().trim().isEmpty()) {
                effectiveBatch = user.get().getBatch();
                debug.put("batchSource", "User table");
            } else {
                debug.put("batchSource", "No batch found");
            }
            debug.put("effectiveBatch", effectiveBatch);
            
            // Check routines for this batch if batch exists
            if (effectiveBatch != null) {
                List<Routine> routines = routineRepository.findRoutinesWithDetailsForBatch(effectiveBatch);
                debug.put("routinesForBatch", routines.size());
            }
            
            return ResponseEntity.ok(Map.of("success", true, "debug", debug));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Debug error: " + e.getMessage()));
        }
    }
}