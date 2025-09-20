package com.university.attendance.dto;

public class CourseResponse {
    
    private Long id;
    private String code;
    private String title;
    private Integer credit;
    private String description;

    // Default constructor
    public CourseResponse() {}

    // Constructor with parameters
    public CourseResponse(Long id, String code, String title, Integer credit, String description) {
        this.id = id;
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