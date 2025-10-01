package com.university.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateRoutineRequest {
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotBlank(message = "Course time is required")
    private String courseTime; // Format: "HH:MM" (e.g., "09:00", "14:30")
    
    @NotBlank(message = "End time is required")
    private String endTime; // Format: "HH:MM" (e.g., "10:00", "15:30")
    
    @NotBlank(message = "Day is required")
    private String day;
    
    @NotBlank(message = "Username is required")
    private String username; // Teacher's username
    
    @NotBlank(message = "Student batch is required")
    private String studentBatch;
    
    // Default constructor
    public CreateRoutineRequest() {}
    
    // Constructor with parameters
    public CreateRoutineRequest(Long courseId, String courseTime, String endTime, String day, String username, String studentBatch) {
        this.courseId = courseId;
        this.courseTime = courseTime;
        this.endTime = endTime;
        this.day = day;
        this.username = username;
        this.studentBatch = studentBatch;
    }
    
    // Getters and setters
    public Long getCourseId() {
        return courseId;
    }
    
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    
    public String getCourseTime() {
        return courseTime;
    }
    
    public void setCourseTime(String courseTime) {
        this.courseTime = courseTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public String getDay() {
        return day;
    }
    
    public void setDay(String day) {
        this.day = day;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getStudentBatch() {
        return studentBatch;
    }
    
    public void setStudentBatch(String studentBatch) {
        this.studentBatch = studentBatch;
    }
}