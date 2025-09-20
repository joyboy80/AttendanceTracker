package com.university.attendance.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendanceID")
    private Long attendanceID;

    @Column(name = "studentID", nullable = false)
    private Long studentID;

    @Column(name = "courseCode")
    private String courseCode;

    @Column(name = "sessionID")
    private Long sessionID;

    @Column(name = "attendance_code", nullable = false)
    private String attendanceCode;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "status", nullable = false)
    private String status;

    public Long getAttendanceID() { return attendanceID; }
    public void setAttendanceID(Long attendanceID) { this.attendanceID = attendanceID; }

    public Long getStudentID() { return studentID; }
    public void setStudentID(Long studentID) { this.studentID = studentID; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public Long getSessionID() { return sessionID; }
    public void setSessionID(Long sessionID) { this.sessionID = sessionID; }

    public String getAttendanceCode() { return attendanceCode; }
    public void setAttendanceCode(String attendanceCode) { this.attendanceCode = attendanceCode; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}


