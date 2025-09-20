package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    @NotNull(message = "User ID is required")
    private Long userId;

    @Column(name = "course_id", nullable = false)
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @Column(name = "assigned_by", nullable = false)
    @NotNull(message = "Assigned by user ID is required")
    private Long assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @NotNull(message = "Enrollment role is required")
    private EnrollmentRole role;

    // Default constructor
    public Enrollment() {}

    // Constructor with parameters
    public Enrollment(Long userId, Long courseId, Long assignedBy, EnrollmentRole role) {
        this.userId = userId;
        this.courseId = courseId;
        this.assignedBy = assignedBy;
        this.role = role;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(Long assignedBy) {
        this.assignedBy = assignedBy;
    }

    public EnrollmentRole getRole() {
        return role;
    }

    public void setRole(EnrollmentRole role) {
        this.role = role;
    }
}