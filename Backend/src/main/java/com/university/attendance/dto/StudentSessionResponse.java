package com.university.attendance.dto;

import com.university.attendance.entity.SessionStatus;
import java.time.Instant;

public class StudentSessionResponse {
    private Long sessionID;
    private String courseCode;
    private String accessCode;
    private Instant expiryTime;
    private SessionStatus status;
    private Boolean isActive;
    private String teacherName;
    private String teacherUsername;
    private Integer remainingTime;

    public StudentSessionResponse() {}

    public StudentSessionResponse(Long sessionID, String courseCode, String accessCode, 
                                Instant expiryTime, SessionStatus status, Boolean isActive,
                                String teacherName, String teacherUsername, Integer remainingTime) {
        this.sessionID = sessionID;
        this.courseCode = courseCode;
        this.accessCode = accessCode;
        this.expiryTime = expiryTime;
        this.status = status;
        this.isActive = isActive;
        this.teacherName = teacherName;
        this.teacherUsername = teacherUsername;
        this.remainingTime = remainingTime;
    }

    public Long getSessionID() { return sessionID; }
    public void setSessionID(Long sessionID) { this.sessionID = sessionID; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public Instant getExpiryTime() { return expiryTime; }
    public void setExpiryTime(Instant expiryTime) { this.expiryTime = expiryTime; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getTeacherUsername() { return teacherUsername; }
    public void setTeacherUsername(String teacherUsername) { this.teacherUsername = teacherUsername; }

    public Integer getRemainingTime() { return remainingTime; }
    public void setRemainingTime(Integer remainingTime) { this.remainingTime = remainingTime; }
}