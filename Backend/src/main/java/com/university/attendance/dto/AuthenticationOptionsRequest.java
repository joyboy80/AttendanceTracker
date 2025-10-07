package com.university.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthenticationOptionsRequest {
    @JsonProperty("userId")
    private Long userId;
    
    // Default constructor
    public AuthenticationOptionsRequest() {}
    
    // Constructor with parameters
    public AuthenticationOptionsRequest(Long userId) {
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