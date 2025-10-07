package com.university.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegistrationRequest {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("rawId")
    private String rawId;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("response")
    private AuthenticatorAttestationResponse response;
    
    @JsonProperty("userId")
    private Long userId;
    
    // Default constructor
    public RegistrationRequest() {}
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getRawId() {
        return rawId;
    }
    
    public void setRawId(String rawId) {
        this.rawId = rawId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public AuthenticatorAttestationResponse getResponse() {
        return response;
    }
    
    public void setResponse(AuthenticatorAttestationResponse response) {
        this.response = response;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    // Nested class
    public static class AuthenticatorAttestationResponse {
        @JsonProperty("clientDataJSON")
        private String clientDataJSON;
        
        @JsonProperty("attestationObject")
        private String attestationObject;
        
        public AuthenticatorAttestationResponse() {}
        
        public String getClientDataJSON() {
            return clientDataJSON;
        }
        
        public void setClientDataJSON(String clientDataJSON) {
            this.clientDataJSON = clientDataJSON;
        }
        
        public String getAttestationObject() {
            return attestationObject;
        }
        
        public void setAttestationObject(String attestationObject) {
            this.attestationObject = attestationObject;
        }
    }
}