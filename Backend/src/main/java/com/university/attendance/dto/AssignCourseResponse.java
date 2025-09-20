package com.university.attendance.dto;

import java.util.List;

public class AssignCourseResponse {
    
    private String message;
    private int totalAssigned;
    private List<String> successfulAssignments;
    private List<String> failedAssignments;

    // Default constructor
    public AssignCourseResponse() {}

    // Constructor with parameters
    public AssignCourseResponse(String message, int totalAssigned, List<String> successfulAssignments, List<String> failedAssignments) {
        this.message = message;
        this.totalAssigned = totalAssigned;
        this.successfulAssignments = successfulAssignments;
        this.failedAssignments = failedAssignments;
    }

    // Getters and setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotalAssigned() {
        return totalAssigned;
    }

    public void setTotalAssigned(int totalAssigned) {
        this.totalAssigned = totalAssigned;
    }

    public List<String> getSuccessfulAssignments() {
        return successfulAssignments;
    }

    public void setSuccessfulAssignments(List<String> successfulAssignments) {
        this.successfulAssignments = successfulAssignments;
    }

    public List<String> getFailedAssignments() {
        return failedAssignments;
    }

    public void setFailedAssignments(List<String> failedAssignments) {
        this.failedAssignments = failedAssignments;
    }
}