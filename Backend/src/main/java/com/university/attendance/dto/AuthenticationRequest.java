package com.university.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthenticationRequest {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("rawId")
    private String rawId;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("response")
    private AuthenticatorAssertionResponse response;
    
    @JsonProperty("userId")
    private Long userId;
    
    // Default constructor
    public AuthenticationRequest() {}
    
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
    
    public AuthenticatorAssertionResponse getResponse() {
        return response;
    }
    
    public void setResponse(AuthenticatorAssertionResponse response) {
        this.response = response;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    // Nested class
    public static class AuthenticatorAssertionResponse {
        @JsonProperty("clientDataJSON")
        private String clientDataJSON;
        
        @JsonProperty("authenticatorData")
        private String authenticatorData;
        
        @JsonProperty("signature")
        private String signature;
        
        @JsonProperty("userHandle")
        private String userHandle;
        
        public AuthenticatorAssertionResponse() {}
        
        public String getClientDataJSON() {
            return clientDataJSON;
        }
        
        public void setClientDataJSON(String clientDataJSON) {
            this.clientDataJSON = clientDataJSON;
        }
        
        public String getAuthenticatorData() {
            return authenticatorData;
        }
        
        public void setAuthenticatorData(String authenticatorData) {
            this.authenticatorData = authenticatorData;
        }
        
        public String getSignature() {
            return signature;
        }
        
        public void setSignature(String signature) {
            this.signature = signature;
        }
        
        public String getUserHandle() {
            return userHandle;
        }
        
        public void setUserHandle(String userHandle) {
            this.userHandle = userHandle;
        }
    }
}