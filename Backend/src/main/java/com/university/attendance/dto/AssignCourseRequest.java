package com.university.attendance.dto;

import com.university.attendance.entity.EnrollmentRole;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AssignCourseRequest {
    
    @NotEmpty(message = "At least one username is required")
    private List<String> usernames;
    
    @NotNull(message = "Role is required")
    private EnrollmentRole role;

    // Default constructor
    public AssignCourseRequest() {}

    // Constructor with parameters
    public AssignCourseRequest(List<String> usernames, EnrollmentRole role) {
        this.usernames = usernames;
        this.role = role;
    }

    // Getters and setters
    public List<String> getUsernames() {
        return usernames;
    }

    public void setUsernames(List<String> usernames) {
        this.usernames = usernames;
    }

    public EnrollmentRole getRole() {
        return role;
    }

    public void setRole(EnrollmentRole role) {
        this.role = role;
    }
}