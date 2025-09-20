package com.university.attendance.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "class_sessions")
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sessionID")
    private Long sessionID;

    @Column(name = "courseCode")
    private String courseCode;

    @Column(name = "scheduled_time")
    private Instant scheduledTime;

    @Column(name = "duration")
    private Integer durationMinutes;

    @Column(name = "access_code")
    private String accessCode;

    @Column(name = "expiry_time")
    private Instant expiryTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SessionStatus status;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "remaining_time")
    private Integer remainingTime;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "teacher_username")
    private String teacherUsername;

    public Long getSessionID() { return sessionID; }
    public void setSessionID(Long sessionID) { this.sessionID = sessionID; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public Instant getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(Instant scheduledTime) { this.scheduledTime = scheduledTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public Instant getExpiryTime() { return expiryTime; }
    public void setExpiryTime(Instant expiryTime) { this.expiryTime = expiryTime; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getRemainingTime() { return remainingTime; }
    public void setRemainingTime(Integer remainingTime) { this.remainingTime = remainingTime; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getTeacherUsername() { return teacherUsername; }
    public void setTeacherUsername(String teacherUsername) { this.teacherUsername = teacherUsername; }
}


