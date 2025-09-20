package com.university.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateCourseRequest {
    
    @NotBlank(message = "Course code is required")
    private String code;
    
    @NotBlank(message = "Course title is required")
    private String title;
    
    @NotNull(message = "Credit hours are required")
    private Integer credit;
    
    private String description;

    // Default constructor
    public CreateCourseRequest() {}

    // Constructor with parameters
    public CreateCourseRequest(String code, String title, Integer credit, String description) {
        this.code = code;
        this.title = title;
        this.credit = credit;
        this.description = description;
    }

    // Getters and setters
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