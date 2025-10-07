package com.university.attendance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.university.attendance.repository.UserRepository;
import com.university.attendance.repository.TeacherRepository;
import com.university.attendance.repository.StudentRepository;
import com.university.attendance.repository.AttendanceRepository;
import com.university.attendance.entity.User;
import com.university.attendance.entity.Teacher;
import com.university.attendance.entity.Student;
import com.university.attendance.entity.UserRole;
import com.university.attendance.entity.Attendance;

import com.university.attendance.repository.CourseRepository;
import com.university.attendance.repository.EnrollmentRepository;
import com.university.attendance.entity.Course;
import com.university.attendance.entity.Enrollment;
import com.university.attendance.entity.EnrollmentRole;
import com.university.attendance.service.FileStorageService;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/debug/{userId}")
    public ResponseEntity<?> debugUser(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "debug", "User entity structure",
                "id", user.getUserID(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "username", user.getUsername(),
                "role", user.getRole().toString(),
                "batch", user.getBatch(),
                "entityClass", user.getClass().getSimpleName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "stackTrace", e.getStackTrace()));
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Map<String, Object> profileData = new HashMap<>();
            
            // Basic user information
            profileData.put("id", user.getUserID());
            profileData.put("username", user.getUsername());
            profileData.put("name", user.getName());
            profileData.put("email", user.getEmail());
            profileData.put("phone", user.getPhone() != null ? user.getPhone() : "");
            profileData.put("role", user.getRole().toString().toLowerCase());
            profileData.put("photo", user.getPhoto());
            if (user.getPhoto() != null) {
                profileData.put("photoUrl", "http://localhost:8080" + user.getPhoto());
            }
            profileData.put("status", "Active");
            
            // Join date (placeholder since created_at doesn't exist in User entity)
            profileData.put("joinDate", "Not available");

            // Last login (placeholder - can be enhanced with actual tracking)
            profileData.put("lastLogin", "Current session");

            // Role-specific information
            if (user.getRole() == UserRole.STUDENT) {
                // Get student-specific information
                Optional<Student> studentOpt = studentRepository.findById(user.getUserID());
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    profileData.put("batch", student.getBatch());
                    profileData.put("studentId", student.getUserID());
                    profileData.put("department", student.getDepartment());
                    profileData.put("section", student.getSection());
                } else {
                    profileData.put("batch", user.getBatch()); // Fallback to users table
                    profileData.put("department", "Not specified");
                    profileData.put("section", "Not specified");
                }
            } else if (user.getRole() == UserRole.TEACHER) {
                // Get teacher-specific information
                Optional<Teacher> teacherOpt = teacherRepository.findById(user.getUserID());
                if (teacherOpt.isPresent()) {
                    Teacher teacher = teacherOpt.get();
                    profileData.put("teacherId", teacher.getUserID());
                    profileData.put("department", teacher.getDepartment());
                    profileData.put("designation", teacher.getDesignation());
                } else {
                    profileData.put("department", "Not specified");
                    profileData.put("designation", "Not specified");
                }
            } else if (user.getRole() == UserRole.ADMIN) {
                // Admin-specific information
                profileData.put("adminLevel", "System Administrator");
                profileData.put("permissions", "Full Access");
            }

            return ResponseEntity.ok(profileData);

        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    @PutMapping("/profile/{userId}")
    @Transactional
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody Map<String, Object> updates) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }

            // Validation
            if (updates.containsKey("name")) {
                String name = (String) updates.get("name");
                if (name == null || name.trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Name cannot be empty"));
                }
                if (name.trim().length() > 100) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Name cannot exceed 100 characters"));
                }
            }

            if (updates.containsKey("email")) {
                String email = (String) updates.get("email");
                if (email == null || email.trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email cannot be empty"));
                }
                // Basic email validation
                if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid email format"));
                }
                if (email.trim().length() > 100) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email cannot exceed 100 characters"));
                }
                // Check if email is already in use by another user
                User currentUser = userOpt.get();
                if (!email.trim().equals(currentUser.getEmail()) && userRepository.existsByEmail(email.trim())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is already in use by another user"));
                }
            }

            if (updates.containsKey("phone")) {
                String phone = (String) updates.get("phone");
                if (phone != null && phone.trim().length() > 20) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Phone number cannot exceed 20 characters"));
                }
            }

            // Get fresh managed entity to avoid detachment issues
            User managedUser = userRepository.findById(userId).orElse(null);
            if (managedUser == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found during update"));
            }

            System.out.println("Updating user: " + managedUser.getUserID() + ", Class: " + managedUser.getClass().getSimpleName());
            
            // Store original values for logging
            String originalName = managedUser.getName();
            String originalEmail = managedUser.getEmail();
            String originalPhone = managedUser.getPhone();

            // Update basic information with validation
            boolean hasChanges = false;
            if (updates.containsKey("name")) {
                String name = (String) updates.get("name");
                if (name != null && !name.trim().isEmpty() && !name.trim().equals(originalName)) {
                    managedUser.setName(name.trim());
                    hasChanges = true;
                    System.out.println("Name updated from '" + originalName + "' to '" + name.trim() + "'");
                }
            }
            if (updates.containsKey("email")) {
                String email = (String) updates.get("email");
                if (email != null && !email.trim().isEmpty() && !email.trim().equals(originalEmail)) {
                    managedUser.setEmail(email.trim());
                    hasChanges = true;
                    System.out.println("Email updated from '" + originalEmail + "' to '" + email.trim() + "'");
                }
            }
            if (updates.containsKey("phone")) {
                String phone = (String) updates.get("phone");
                String newPhone = (phone != null && !phone.trim().isEmpty()) ? phone.trim() : null;
                if ((newPhone == null && originalPhone != null) || (newPhone != null && !newPhone.equals(originalPhone))) {
                    managedUser.setPhone(newPhone);
                    hasChanges = true;
                    System.out.println("Phone updated from '" + originalPhone + "' to '" + newPhone + "'");
                }
            }

            if (!hasChanges) {
                System.out.println("No changes detected, returning current data");
                return ResponseEntity.ok(Map.of(
                    "message", "No changes to update",
                    "user", Map.of(
                        "id", managedUser.getUserID(),
                        "name", managedUser.getName(),
                        "email", managedUser.getEmail(),
                        "phone", managedUser.getPhone() != null ? managedUser.getPhone() : "",
                        "role", managedUser.getRole().toString().toLowerCase()
                    )
                ));
            }

            // Save updated user
            System.out.println("Saving user changes...");
            User savedUser = userRepository.save(managedUser);
            System.out.println("User saved successfully: " + savedUser.getUserID());            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", Map.of(
                    "id", savedUser.getUserID(),
                    "name", savedUser.getName(),
                    "email", savedUser.getEmail(),
                    "phone", savedUser.getPhone() != null ? savedUser.getPhone() : "",
                    "role", savedUser.getRole().toString().toLowerCase()
                )
            ));

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("Data integrity violation during profile update: " + e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", "Data validation failed", "details", "Email might already be in use or data constraints violated"));
        } catch (org.springframework.transaction.TransactionException e) {
            System.err.println("Transaction error during profile update: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Transaction failed", "details", "Could not complete the profile update"));
        } catch (Exception e) {
            System.err.println("Unexpected error updating user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    @GetMapping("/student/dashboard/{userId}")
    public ResponseEntity<?> getStudentDashboard(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getRole() != UserRole.STUDENT) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User is not a student"));
            }

            // Get all attendance records for this student
            List<Attendance> studentAttendanceRecords = attendanceRepository.findAll().stream()
                .filter(attendance -> attendance.getStudentID().equals(userId))
                .collect(java.util.stream.Collectors.toList());

            // Calculate statistics
            long totalClasses = studentAttendanceRecords.size();
            long attendedClasses = studentAttendanceRecords.stream()
                .filter(attendance -> "PRESENT".equals(attendance.getStatus()))
                .count();
            long missedClasses = totalClasses - attendedClasses;
            double attendanceRate = totalClasses > 0 ? 
                ((double) attendedClasses / totalClasses) * 100 : 0;

            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("totalClasses", totalClasses);
            dashboardData.put("attendedClasses", attendedClasses);
            dashboardData.put("missedClasses", missedClasses);
            dashboardData.put("attendanceRate", Math.round(attendanceRate * 10.0) / 10.0);
            dashboardData.put("studentName", user.getName());
            dashboardData.put("batch", user.getBatch());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "dashboard", dashboardData
            ));

        } catch (Exception e) {
            System.err.println("Error fetching student dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    /**
     * Student statistics endpoint: returns all attendance records, statistics, and available courses for filtering.
     */
    @GetMapping("/student/statistics/{userId}")
    public ResponseEntity<?> getStudentStatistics(@PathVariable Long userId, @RequestParam(required = false) String courseCode) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            User user = userOpt.get();
            if (user.getRole() != UserRole.STUDENT) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a student"));
            }

            // Get all attendance records for this student
            List<Attendance> allRecords = attendanceRepository.findAll().stream()
                .filter(a -> a.getStudentID().equals(userId))
                .collect(Collectors.toList());

            // Filter by course if specified
            List<Attendance> filteredRecords = allRecords;
            if (courseCode != null && !courseCode.equals("all")) {
                filteredRecords = allRecords.stream()
                    .filter(a -> courseCode.equals(a.getCourseCode()))
                    .collect(Collectors.toList());
            }

            // Get available courses for this student
            List<String> studentCourses = allRecords.stream()
                .map(Attendance::getCourseCode)
                .filter(code -> code != null)
                .distinct()
                .collect(Collectors.toList());

            List<Map<String, Object>> courses = new ArrayList<>();
            courses.add(Map.of("id", "all", "name", "All Subjects"));
            for (String code : studentCourses) {
                Optional<Course> courseOpt = courseRepository.findByCode(code);
                if (courseOpt.isPresent()) {
                    Course course = courseOpt.get();
                    courses.add(Map.of("id", code, "name", course.getTitle()));
                } else {
                    courses.add(Map.of("id", code, "name", code));
                }
            }

            // Calculate statistics
            long totalClasses = filteredRecords.size();
            long attendedClasses = filteredRecords.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
            long missedClasses = totalClasses - attendedClasses;
            double attendanceRate = totalClasses > 0 ? ((double) attendedClasses / totalClasses) * 100 : 0;

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("total", totalClasses);
            statistics.put("present", attendedClasses);
            statistics.put("absent", missedClasses);
            statistics.put("percentage", Math.round(attendanceRate * 10.0) / 10.0);

            // Prepare attendance records for display
            List<Map<String, Object>> attendanceData = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault());
            for (Attendance record : filteredRecords) {
                Map<String, Object> recordData = new HashMap<>();
                recordData.put("date", formatter.format(record.getTimestamp()));
                recordData.put("time", timeFormatter.format(record.getTimestamp()));
                recordData.put("status", record.getStatus());
                // Get course name
                String courseName = record.getCourseCode();
                if (record.getCourseCode() != null) {
                    Optional<Course> courseOpt = courseRepository.findByCode(record.getCourseCode());
                    if (courseOpt.isPresent()) {
                        courseName = courseOpt.get().getTitle();
                    }
                }
                recordData.put("subject", courseName);
                attendanceData.add(recordData);
            }
            // Sort by date descending
            attendanceData.sort((a, b) -> ((String) b.get("date")).compareTo((String) a.get("date")) * -1);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            response.put("attendanceRecords", attendanceData);
            response.put("courses", courses);
            response.put("selectedCourse", courseCode != null ? courseCode : "all");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    /**
     * Teacher statistics endpoint: returns attendance data for courses taught by the teacher, 
     * class-wise attendance records, student performance in their classes, and available courses for filtering.
     */
    @GetMapping("/teacher/statistics/{userId}")
    public ResponseEntity<?> getTeacherStatistics(@PathVariable Long userId, @RequestParam(required = false) String courseCode) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            User user = userOpt.get();
            if (user.getRole() != UserRole.TEACHER) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a teacher"));
            }

            // Get courses taught by this teacher through enrollments
            List<Enrollment> teacherEnrollments = enrollmentRepository.findByUserIdAndRole(userId, EnrollmentRole.TEACHER);
            List<Long> teacherCourseIds = teacherEnrollments.stream()
                .map(Enrollment::getCourseId)
                .collect(Collectors.toList());

            if (teacherCourseIds.isEmpty()) {
                // Teacher has no courses assigned
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("statistics", Map.of(
                    "totalClasses", 0,
                    "totalStudents", 0,
                    "avgAttendance", 0.0,
                    "totalPresent", 0
                ));
                response.put("attendanceData", new ArrayList<>());
                response.put("studentList", new ArrayList<>());
                response.put("courses", List.of(Map.of("id", "all", "name", "All Subjects")));
                response.put("selectedCourse", courseCode != null ? courseCode : "all");
                return ResponseEntity.ok(response);
            }

            // Get course codes and names for courses taught by teacher
            List<String> teacherCourseCodes = new ArrayList<>();
            List<Map<String, Object>> courses = new ArrayList<>();
            courses.add(Map.of("id", "all", "name", "All Subjects"));
            
            for (Long courseId : teacherCourseIds) {
                Optional<Course> courseOpt = courseRepository.findById(courseId);
                if (courseOpt.isPresent()) {
                    Course course = courseOpt.get();
                    teacherCourseCodes.add(course.getCode());
                    courses.add(Map.of("id", course.getCode(), "name", course.getTitle()));
                }
            }

            // Get all attendance records for courses taught by this teacher
            List<Attendance> allRecords = attendanceRepository.findAll().stream()
                .filter(a -> teacherCourseCodes.contains(a.getCourseCode()))
                .collect(Collectors.toList());

            // Filter by course if specified
            List<Attendance> filteredRecords = allRecords;
            if (courseCode != null && !courseCode.equals("all")) {
                filteredRecords = allRecords.stream()
                    .filter(a -> courseCode.equals(a.getCourseCode()))
                    .collect(Collectors.toList());
            }

            // Calculate overall statistics
            long totalClasses = filteredRecords.stream()
                .collect(Collectors.groupingBy(a -> a.getCourseCode() + "_" + 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault()).format(a.getTimestamp())))
                .size();
            
            long totalPresent = filteredRecords.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
            
            long totalRecords = filteredRecords.size();
            double avgAttendance = totalRecords > 0 ? ((double) totalPresent / totalRecords) * 100 : 0;
            
            // Get unique students count
            long totalStudents = filteredRecords.stream()
                .map(Attendance::getStudentID)
                .distinct()
                .count();

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalClasses", totalClasses);
            statistics.put("totalStudents", totalStudents);
            statistics.put("avgAttendance", Math.round(avgAttendance * 10.0) / 10.0);
            statistics.put("totalPresent", totalPresent);

            // Prepare class-wise attendance data (group by course and date)
            List<Map<String, Object>> attendanceData = new ArrayList<>();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
            
            Map<String, List<Attendance>> groupedByClassDate = filteredRecords.stream()
                .collect(Collectors.groupingBy(a -> a.getCourseCode() + "_" + dateFormatter.format(a.getTimestamp())));
            
            for (Map.Entry<String, List<Attendance>> entry : groupedByClassDate.entrySet()) {
                List<Attendance> classRecords = entry.getValue();
                if (!classRecords.isEmpty()) {
                    Attendance firstRecord = classRecords.get(0);
                    long present = classRecords.stream()
                        .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                        .count();
                    long total = classRecords.size();
                    double percentage = total > 0 ? ((double) present / total) * 100 : 0;
                    
                    // Get course name
                    String courseName = firstRecord.getCourseCode();
                    Optional<Course> courseOpt = courseRepository.findByCode(firstRecord.getCourseCode());
                    if (courseOpt.isPresent()) {
                        courseName = courseOpt.get().getTitle();
                    }
                    
                    Map<String, Object> classData = new HashMap<>();
                    classData.put("date", dateFormatter.format(firstRecord.getTimestamp()));
                    classData.put("subject", courseName);
                    classData.put("present", present);
                    classData.put("total", total);
                    classData.put("percentage", Math.round(percentage * 10.0) / 10.0);
                    attendanceData.add(classData);
                }
            }
            
            // Sort by date descending
            attendanceData.sort((a, b) -> ((String) b.get("date")).compareTo((String) a.get("date")));

            // Prepare student performance data
            List<Map<String, Object>> studentList = new ArrayList<>();
            Map<Long, List<Attendance>> studentRecords = filteredRecords.stream()
                .collect(Collectors.groupingBy(Attendance::getStudentID));
            
            for (Map.Entry<Long, List<Attendance>> entry : studentRecords.entrySet()) {
                Long studentId = entry.getKey();
                List<Attendance> studentAttendance = entry.getValue();
                
                Optional<User> studentOpt = userRepository.findById(studentId);
                if (studentOpt.isPresent()) {
                    User student = studentOpt.get();
                    
                    long attendance = studentAttendance.stream()
                        .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                        .count();
                    long total = studentAttendance.size();
                    double percentage = total > 0 ? ((double) attendance / total) * 100 : 0;
                    
                    // Get student roll number from student entity if available
                    String rollNo = "N/A";
                    Optional<Student> studentEntityOpt = studentRepository.findById(studentId);
                    if (studentEntityOpt.isPresent()) {
                        rollNo = studentId.toString(); // Use ID as roll number for now
                    }
                    
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("name", student.getName());
                    studentData.put("rollNo", rollNo);
                    studentData.put("attendance", attendance);
                    studentData.put("total", total);
                    studentData.put("percentage", Math.round(percentage * 10.0) / 10.0);
                    studentList.add(studentData);
                }
            }
            
            // Sort students by attendance percentage descending
            studentList.sort((a, b) -> {
                Double percentageA = (Double) a.get("percentage");
                Double percentageB = (Double) b.get("percentage");
                return percentageB.compareTo(percentageA);
            });

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            response.put("attendanceData", attendanceData);
            response.put("studentList", studentList);
            response.put("courses", courses);
            response.put("selectedCourse", courseCode != null ? courseCode : "all");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching teacher statistics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    /**
     * Teacher dashboard endpoint: returns overview statistics for teacher including 
     * total students, classes this week, average attendance, and recent activities.
     */
    @GetMapping("/teacher/dashboard/{userId}")
    public ResponseEntity<?> getTeacherDashboard(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            User user = userOpt.get();
            if (user.getRole() != UserRole.TEACHER) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a teacher"));
            }

            // Get courses taught by this teacher through enrollments
            List<Enrollment> teacherEnrollments = enrollmentRepository.findByUserIdAndRole(userId, EnrollmentRole.TEACHER);
            List<Long> teacherCourseIds = teacherEnrollments.stream()
                .map(Enrollment::getCourseId)
                .collect(Collectors.toList());

            if (teacherCourseIds.isEmpty()) {
                // Teacher has no courses assigned
                Map<String, Object> dashboardData = new HashMap<>();
                dashboardData.put("totalStudents", 0);
                dashboardData.put("classesThisWeek", 0);
                dashboardData.put("averageAttendance", 0.0);
                dashboardData.put("todayClasses", 0);
                dashboardData.put("recentActivities", new ArrayList<>());
                dashboardData.put("teacherName", user.getName());
                
                return ResponseEntity.ok(Map.of("success", true, "dashboard", dashboardData));
            }

            // Get course codes for courses taught by teacher
            List<String> teacherCourseCodes = new ArrayList<>(); 
            for (Long courseId : teacherCourseIds) {
                Optional<Course> courseOpt = courseRepository.findById(courseId);
                if (courseOpt.isPresent()) {
                    teacherCourseCodes.add(courseOpt.get().getCode());
                }
            }

            // Get all attendance records for courses taught by this teacher
            List<Attendance> allRecords = attendanceRepository.findAll().stream()
                .filter(a -> teacherCourseCodes.contains(a.getCourseCode()))
                .collect(Collectors.toList());

            // Calculate total unique students
            long totalStudents = allRecords.stream()
                .map(Attendance::getStudentID)
                .distinct()
                .count();

            // Calculate classes this week (group by course and date for current week)
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate startOfWeek = now.with(java.time.DayOfWeek.MONDAY);
            java.time.LocalDate endOfWeek = startOfWeek.plusDays(6);
            
            long classesThisWeek = allRecords.stream()
                .filter(a -> {
                    java.time.LocalDate recordDate = a.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate();
                    return !recordDate.isBefore(startOfWeek) && !recordDate.isAfter(endOfWeek);
                })
                .collect(Collectors.groupingBy(a -> a.getCourseCode() + "_" + 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault()).format(a.getTimestamp())))
                .size();

            // Calculate today's classes
            java.time.LocalDate today = java.time.LocalDate.now();
            long todayClasses = allRecords.stream()
                .filter(a -> {
                    java.time.LocalDate recordDate = a.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate();
                    return recordDate.equals(today);
                })
                .collect(Collectors.groupingBy(a -> a.getCourseCode()))
                .size();

            // Calculate average attendance
            long totalPresent = allRecords.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
            double averageAttendance = allRecords.size() > 0 ? 
                ((double) totalPresent / allRecords.size()) * 100 : 0;

            // Generate recent activities (last 5 class sessions)
            List<Map<String, Object>> recentActivities = new ArrayList<>();
            Map<String, List<Attendance>> classSessions = allRecords.stream()
                .collect(Collectors.groupingBy(a -> a.getCourseCode() + "_" + 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault()).format(a.getTimestamp())));
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault());
            
            classSessions.entrySet().stream()
                .sorted((e1, e2) -> {
                    Attendance a1 = e1.getValue().get(0);
                    Attendance a2 = e2.getValue().get(0);
                    return a2.getTimestamp().compareTo(a1.getTimestamp());
                })
                .limit(5)
                .forEach(entry -> {
                    List<Attendance> classRecords = entry.getValue();
                    if (!classRecords.isEmpty()) {
                        Attendance firstRecord = classRecords.get(0);
                        long present = classRecords.stream()
                            .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                            .count();
                        
                        // Get course name
                        String courseName = firstRecord.getCourseCode();
                        Optional<Course> courseOpt = courseRepository.findByCode(firstRecord.getCourseCode());
                        if (courseOpt.isPresent()) {
                            courseName = courseOpt.get().getTitle();
                        }
                        
                        Map<String, Object> activity = new HashMap<>();
                        activity.put("type", "attendance");
                        activity.put("icon", "fas fa-check-circle");
                        activity.put("color", "success");
                        activity.put("title", courseName + " - Attendance Completed");
                        activity.put("description", present + " students marked present");
                        activity.put("date", dateFormatter.format(firstRecord.getTimestamp()));
                        activity.put("time", timeFormatter.format(firstRecord.getTimestamp()));
                        
                        // Calculate relative time
                        java.time.Duration duration = java.time.Duration.between(firstRecord.getTimestamp(), java.time.Instant.now());
                        long hours = duration.toHours();
                        long days = duration.toDays();
                        String timeAgo;
                        if (days > 0) {
                            timeAgo = days + (days == 1 ? " day ago" : " days ago");
                        } else if (hours > 0) {
                            timeAgo = hours + (hours == 1 ? " hour ago" : " hours ago");
                        } else {
                            timeAgo = "Recently";
                        }
                        activity.put("timeAgo", timeAgo);
                        
                        recentActivities.add(activity);
                    }
                });

            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("totalStudents", totalStudents);
            dashboardData.put("classesThisWeek", classesThisWeek);
            dashboardData.put("averageAttendance", Math.round(averageAttendance * 10.0) / 10.0);
            dashboardData.put("todayClasses", todayClasses);
            dashboardData.put("recentActivities", recentActivities);
            dashboardData.put("teacherName", user.getName());

            return ResponseEntity.ok(Map.of("success", true, "dashboard", dashboardData));

        } catch (Exception e) {
            System.err.println("Error fetching teacher dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    @GetMapping("/teacher/attendance/{userId}")
    public ResponseEntity<?> getTeacherAttendanceRecords(@PathVariable Long userId,
                                                        @RequestParam(required = false) String courseCode,
                                                        @RequestParam(required = false) String date) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getRole() != UserRole.TEACHER) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a teacher"));
            }

            // Get teacher's courses through enrollments
            List<String> teacherCourses = enrollmentRepository.findCourseCodesByTeacherId(userId);

            if (teacherCourses.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "attendanceRecords", new ArrayList<>(),
                    "classSessions", new ArrayList<>(),
                    "courses", new ArrayList<>()
                ));
            }

            // Get all attendance records for teacher's courses
            List<Attendance> allRecords = teacherCourses.isEmpty() ? 
                new ArrayList<>() : attendanceRepository.findByCourseCodeIn(teacherCourses);

            // Filter by course code if provided
            if (courseCode != null && !courseCode.isEmpty() && !courseCode.equals("all")) {
                allRecords = allRecords.stream()
                    .filter(a -> a.getCourseCode().equals(courseCode))
                    .collect(Collectors.toList());
            }

            // Filter by date if provided
            if (date != null && !date.isEmpty()) {
                java.time.LocalDate filterDate = java.time.LocalDate.parse(date);
                allRecords = allRecords.stream()
                    .filter(a -> {
                        java.time.LocalDate recordDate = a.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDate();
                        return recordDate.equals(filterDate);
                    })
                    .collect(Collectors.toList());
            }

            // Build detailed attendance records
            List<Map<String, Object>> attendanceRecords = new ArrayList<>();
            for (Attendance record : allRecords) {
                Map<String, Object> recordMap = new HashMap<>();
                recordMap.put("attendanceID", record.getAttendanceID());
                recordMap.put("studentID", record.getStudentID());
                recordMap.put("courseCode", record.getCourseCode());
                recordMap.put("status", record.getStatus());
                recordMap.put("timestamp", record.getTimestamp());
                
                // Get student name
                Optional<User> studentOpt = userRepository.findById(record.getStudentID());
                recordMap.put("studentName", studentOpt.isPresent() ? studentOpt.get().getName() : "Unknown");
                
                // Get course name
                Optional<Course> courseOpt = courseRepository.findByCode(record.getCourseCode());
                recordMap.put("courseName", courseOpt.isPresent() ? courseOpt.get().getTitle() : record.getCourseCode());
                
                // Format date and time
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault());
                recordMap.put("date", dateFormatter.format(record.getTimestamp()));
                recordMap.put("time", timeFormatter.format(record.getTimestamp()));
                
                attendanceRecords.add(recordMap);
            }

            // Build class sessions summary
            Map<String, List<Attendance>> sessionGroups = allRecords.stream()
                .collect(Collectors.groupingBy(a -> a.getCourseCode() + "_" + 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault()).format(a.getTimestamp())));

            List<Map<String, Object>> classSessions = new ArrayList<>();
            for (Map.Entry<String, List<Attendance>> entry : sessionGroups.entrySet()) {
                List<Attendance> sessionRecords = entry.getValue();
                if (!sessionRecords.isEmpty()) {
                    Attendance firstRecord = sessionRecords.get(0);
                    
                    Map<String, Object> session = new HashMap<>();
                    session.put("courseCode", firstRecord.getCourseCode());
                    
                    // Get course name
                    Optional<Course> courseOpt = courseRepository.findByCode(firstRecord.getCourseCode());
                    session.put("courseName", courseOpt.isPresent() ? courseOpt.get().getTitle() : firstRecord.getCourseCode());
                    
                    // Format date
                    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
                    session.put("date", dateFormatter.format(firstRecord.getTimestamp()));
                    
                    // Calculate statistics
                    int totalStudents = sessionRecords.size();
                    long presentStudents = sessionRecords.stream()
                        .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                        .count();
                    int absentStudents = (int) (totalStudents - presentStudents);
                    double attendanceRate = totalStudents > 0 ? 
                        Math.round(((double) presentStudents / totalStudents) * 100.0 * 10.0) / 10.0 : 0.0;
                    
                    session.put("totalStudents", totalStudents);
                    session.put("presentStudents", (int) presentStudents);
                    session.put("absentStudents", absentStudents);
                    session.put("attendanceRate", attendanceRate);
                    session.put("students", sessionRecords.stream().map(a -> {
                        Map<String, Object> studentRecord = new HashMap<>();
                        studentRecord.put("attendanceID", a.getAttendanceID());
                        studentRecord.put("studentID", a.getStudentID());
                        studentRecord.put("status", a.getStatus());
                        
                        // Get student name
                        Optional<User> studentOpt = userRepository.findById(a.getStudentID());
                        studentRecord.put("studentName", studentOpt.isPresent() ? studentOpt.get().getName() : "Unknown");
                        
                        return studentRecord;
                    }).collect(Collectors.toList()));
                    
                    classSessions.add(session);
                }
            }

            // Sort sessions by date (newest first)
            classSessions.sort((s1, s2) -> {
                String date1 = (String) s1.get("date");
                String date2 = (String) s2.get("date");
                return date2.compareTo(date1);
            });

            // Get course information
            List<Map<String, Object>> courses = new ArrayList<>();
            courses.add(Map.of("id", "all", "name", "All Courses", "code", "ALL"));
            
            for (String courseCodeItem : teacherCourses) {
                Optional<Course> courseOpt = courseRepository.findByCode(courseCodeItem);
                if (courseOpt.isPresent()) {
                    Course course = courseOpt.get();
                    courses.add(Map.of(
                        "id", course.getCode(),
                        "name", course.getTitle(),
                        "code", course.getCode()
                    ));
                }
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "attendanceRecords", attendanceRecords,
                "classSessions", classSessions,
                "courses", courses
            ));

        } catch (Exception e) {
            System.err.println("Error fetching teacher attendance records: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/upload-photo")
    @Transactional
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable Long userId, 
                                               @RequestParam("file") MultipartFile file) {
        try {
            // Check if user exists
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            // Delete old photo if exists
            if (user.getPhoto() != null) {
                fileStorageService.deleteFile(user.getPhoto());
            }

            // Store new photo
            String photoPath = fileStorageService.storeFile(file, userId);
            
            // Update user's photo field
            System.out.println("Setting photo path: " + photoPath + " for user ID: " + userId);
            user.setPhoto(photoPath);
            
            // Save user to database
            User savedUser = userRepository.save(user);
            System.out.println("User saved with photo: " + savedUser.getPhoto());
            
            // Double-check by re-fetching from database
            Optional<User> verifyUser = userRepository.findById(userId);
            if (verifyUser.isPresent()) {
                System.out.println("VERIFICATION - User photo in DB: " + verifyUser.get().getPhoto());
            }

            // Return success response with photo URL
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile photo uploaded successfully",
                "photoUrl", photoPath,
                "fullUrl", "http://localhost:8080" + photoPath,
                "userId", userId,
                "savedPhoto", savedUser.getPhoto(),
                "verificationPhoto", verifyUser.isPresent() ? verifyUser.get().getPhoto() : "NOT_FOUND"
            ));

        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "File upload failed: " + e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Error uploading profile photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error", 
                "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/{userId}/photo-status")
    public ResponseEntity<?> getPhotoStatus(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "userId", userId,
                "username", user.getUsername(),
                "photoValue", user.getPhoto() != null ? user.getPhoto() : "NULL",
                "hasPhoto", user.getPhoto() != null
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error", 
                "details", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{userId}/delete-photo")
    public ResponseEntity<?> deleteProfilePhoto(@PathVariable Long userId) {
        try {
            // Check if user exists
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            // Delete photo file if exists
            if (user.getPhoto() != null) {
                fileStorageService.deleteFile(user.getPhoto());
                user.setPhoto(null);
                userRepository.save(user);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile photo deleted successfully"
            ));

        } catch (Exception e) {
            System.err.println("Error deleting profile photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error", 
                "details", e.getMessage()
            ));
        }
    }

}