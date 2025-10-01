package com.university.attendance.dto;

import java.time.LocalTime;
import java.time.LocalDateTime;

public class RoutineResponse {
    
    private Long routineId;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private LocalTime courseTime;
    private LocalTime endTime;
    private String day;
    private Long teacherId;
    private String teacherName;
    private String teacherUsername;
    private String studentBatch;
    private LocalDateTime createdAt;
    
    // Default constructor
    public RoutineResponse() {}
    
    // Constructor with all parameters
    public RoutineResponse(Long routineId, Long courseId, String courseCode, String courseTitle, 
                          LocalTime courseTime, LocalTime endTime, String day, Long teacherId, String teacherName, 
                          String teacherUsername, String studentBatch, LocalDateTime createdAt) {
        this.routineId = routineId;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.courseTime = courseTime;
        this.endTime = endTime;
        this.day = day;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.teacherUsername = teacherUsername;
        this.studentBatch = studentBatch;
        this.createdAt = createdAt;
    }
    
    // Getters and setters
    public Long getRoutineId() {
        return routineId;
    }
    
    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }
    
    public Long getCourseId() {
        return courseId;
    }
    
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    
    public String getCourseCode() {
        return courseCode;
    }
    
    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }
    
    public String getCourseTitle() {
        return courseTitle;
    }
    
    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }
    
    public LocalTime getCourseTime() {
        return courseTime;
    }
    
    public void setCourseTime(LocalTime courseTime) {
        this.courseTime = courseTime;
    }
    
    public LocalTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    
    public String getDay() {
        return day;
    }
    
    public void setDay(String day) {
        this.day = day;
    }
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }
    
    public String getTeacherName() {
        return teacherName;
    }
    
    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
    
    public String getTeacherUsername() {
        return teacherUsername;
    }
    
    public void setTeacherUsername(String teacherUsername) {
        this.teacherUsername = teacherUsername;
    }
    
    public String getStudentBatch() {
        return studentBatch;
    }
    
    public void setStudentBatch(String studentBatch) {
        this.studentBatch = studentBatch;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}