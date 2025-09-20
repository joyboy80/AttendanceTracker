package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "code", unique = true, nullable = false)
    @NotBlank(message = "Course code is required")
    private String code;

    @Column(name = "title", nullable = false)
    @NotBlank(message = "Course title is required")
    private String title;

    @Column(name = "credit", nullable = false)
    @NotNull(message = "Credit hours are required")
    private Integer credit;

    @Column(name = "description", length = 1000)
    private String description;

    // Default constructor
    public Course() {}

    // Constructor with parameters
    public Course(String code, String title, Integer credit, String description) {
        this.code = code;
        this.title = title;
        this.credit = credit;
        this.description = description;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getCredit() {
        return credit;
    }

    public void setCredit(Integer credit) {
        this.credit = credit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}