package com.university.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegistrationOptionsRequest {
    @JsonProperty("userId")
    private Long userId;
    
    // Default constructor
    public RegistrationOptionsRequest() {}
    
    // Constructor with parameters
    public RegistrationOptionsRequest(Long userId) {
        this.userId = userId;
    }
    
    // Getter and setter
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}