package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "routines")
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routineID")
    private Long routineID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseID", nullable = false)
    @NotNull(message = "Course is required")
    private Course course;

    @Column(name = "courseTime", nullable = false)
    @NotNull(message = "Course time is required")
    private LocalTime courseTime;

    @Column(name = "endTime", nullable = false)
    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Column(name = "day", nullable = false, length = 20)
    @NotBlank(message = "Day is required")
    private String day;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherID", nullable = false)
    @NotNull(message = "Teacher is required")
    private Teacher teacher;

    @Column(name = "studentBatch", nullable = false, length = 50)
    @NotBlank(message = "Student batch is required")
    private String studentBatch;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    // Default constructor
    public Routine() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public Routine(Course course, LocalTime courseTime, LocalTime endTime, String day, Teacher teacher, String studentBatch) {
        this.course = course;
        this.courseTime = courseTime;
        this.endTime = endTime;
        this.day = day;
        this.teacher = teacher;
        this.studentBatch = studentBatch;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getRoutineID() {
        return routineID;
    }

    public void setRoutineID(Long routineID) {
        this.routineID = routineID;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
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

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
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

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}