package com.university.attendance.service;

import com.university.attendance.dto.*;
import com.university.attendance.entity.*;
import com.university.attendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    public CourseResponse createCourse(CreateCourseRequest request) {
        // Check if course code already exists
        if (courseRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Course with code '" + request.getCode() + "' already exists");
        }

        Course course = new Course(
            request.getCode(),
            request.getTitle(),
            request.getCredit(),
            request.getDescription()
        );

        Course savedCourse = courseRepository.save(course);

        return new CourseResponse(
            savedCourse.getId(),
            savedCourse.getCode(),
            savedCourse.getTitle(),
            savedCourse.getCredit(),
            savedCourse.getDescription()
        );
    }

    @Transactional
    public AssignCourseResponse assignCourse(Long courseId, AssignCourseRequest request, Long assignedByUserId) {
        // Verify course exists
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        List<String> successfulAssignments = new ArrayList<>();
        List<String> failedAssignments = new ArrayList<>();

        for (String username : request.getUsernames()) {
            try {
                // Find user by username
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isEmpty()) {
                    failedAssignments.add(username + " (user not found)");
                    continue;
                }

                User user = userOpt.get();

                // Check if user is already enrolled in this course
                if (enrollmentRepository.existsByUserIdAndCourseId(user.getUserID(), courseId)) {
                    failedAssignments.add(username + " (already enrolled)");
                    continue;
                }

                // Validate role assignment
                if (request.getRole() == EnrollmentRole.TEACHER && user.getRole() != UserRole.TEACHER) {
                    failedAssignments.add(username + " (not a teacher)");
                    continue;
                }

                if (request.getRole() == EnrollmentRole.STUDENT && user.getRole() != UserRole.STUDENT) {
                    failedAssignments.add(username + " (not a student)");
                    continue;
                }

                // Create enrollment
                Enrollment enrollment = new Enrollment(
                    user.getUserID(),
                    courseId,
                    assignedByUserId,
                    request.getRole()
                );

                enrollmentRepository.save(enrollment);
                successfulAssignments.add(username);

            } catch (Exception e) {
                failedAssignments.add(username + " (error: " + e.getMessage() + ")");
            }
        }

        String message = String.format("Assignment completed. %d successful, %d failed.", 
                                     successfulAssignments.size(), failedAssignments.size());

        return new AssignCourseResponse(message, successfulAssignments.size(), successfulAssignments, failedAssignments);
    }

    @Transactional
    public AssignCourseResponse assignCourseToBatch(Long courseId, String batch, Long assignedByUserId) {
        // Verify course exists
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        // Find all students in the specified batch
        List<User> studentsInBatch = userRepository.findByRoleAndBatch(UserRole.STUDENT, batch);
        
        if (studentsInBatch.isEmpty()) {
            throw new RuntimeException("No students found in batch: " + batch);
        }

        List<String> successfulAssignments = new ArrayList<>();
        List<String> failedAssignments = new ArrayList<>();

        for (User student : studentsInBatch) {
            try {
                // Check if student is already enrolled in this course
                if (enrollmentRepository.existsByUserIdAndCourseId(student.getUserID(), courseId)) {
                    failedAssignments.add(student.getUsername() + " (already enrolled)");
                    continue;
                }

                // Create enrollment for student
                Enrollment enrollment = new Enrollment(
                    student.getUserID(),
                    courseId,
                    assignedByUserId,
                    EnrollmentRole.STUDENT
                );

                enrollmentRepository.save(enrollment);
                successfulAssignments.add(student.getUsername());

            } catch (Exception e) {
                failedAssignments.add(student.getUsername() + " (error: " + e.getMessage() + ")");
            }
        }

        String message = String.format("Batch assignment completed for batch %s. %d students enrolled, %d failed.", 
                                     batch, successfulAssignments.size(), failedAssignments.size());

        return new AssignCourseResponse(message, successfulAssignments.size(), successfulAssignments, failedAssignments);
    }

    public List<CourseResponse> getEnrolledCourses(Long userId, EnrollmentRole role) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserIdAndRole(userId, role);
        
        return enrollments.stream()
                .map(enrollment -> {
                    Optional<Course> courseOpt = courseRepository.findById(enrollment.getCourseId());
                    if (courseOpt.isPresent()) {
                        Course course = courseOpt.get();
                        return new CourseResponse(
                            course.getId(),
                            course.getCode(),
                            course.getTitle(),
                            course.getCredit(),
                            course.getDescription()
                        );
                    }
                    return null;
                })
                .filter(courseResponse -> courseResponse != null)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(course -> new CourseResponse(
                    course.getId(),
                    course.getCode(),
                    course.getTitle(),
                    course.getCredit(),
                    course.getDescription()
                ))
                .collect(Collectors.toList());
    }
}