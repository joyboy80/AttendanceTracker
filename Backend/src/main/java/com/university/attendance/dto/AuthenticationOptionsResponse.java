package com.university.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthenticationOptionsResponse {
    @JsonProperty("challenge")
    private String challenge;
    
    @JsonProperty("timeout")
    private long timeout;
    
    @JsonProperty("rpId")
    private String rpId;
    
    @JsonProperty("allowCredentials")
    private AllowedCredential[] allowCredentials;
    
    @JsonProperty("userVerification")
    private String userVerification;
    
    // Default constructor
    public AuthenticationOptionsResponse() {}
    
    // Constructor
    public AuthenticationOptionsResponse(String challenge, long timeout, String rpId, 
                                       AllowedCredential[] allowCredentials, String userVerification) {
        this.challenge = challenge;
        this.timeout = timeout;
        this.rpId = rpId;
        this.allowCredentials = allowCredentials;
        this.userVerification = userVerification;
    }
    
    // Getters and setters
    public String getChallenge() {
        return challenge;
    }
    
    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }
    
    public long getTimeout() {
        return timeout;
    }
    
    public void setTimeout(long timeout) {
        this.timeout = timeout;
    }
    
    public String getRpId() {
        return rpId;
    }
    
    public void setRpId(String rpId) {
        this.rpId = rpId;
    }
    
    public AllowedCredential[] getAllowCredentials() {
        return allowCredentials;
    }
    
    public void setAllowCredentials(AllowedCredential[] allowCredentials) {
        this.allowCredentials = allowCredentials;
    }
    
    public String getUserVerification() {
        return userVerification;
    }
    
    public void setUserVerification(String userVerification) {
        this.userVerification = userVerification;
    }
    
    // Nested class
    public static class AllowedCredential {
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("id")
        private String id;
        
        public AllowedCredential() {}
        
        public AllowedCredential(String type, String id) {
            this.type = type;
            this.id = id;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
    }
}