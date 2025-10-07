package com.university.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegistrationOptionsResponse {
    @JsonProperty("challenge")
    private String challenge;
    
    @JsonProperty("rp")
    private RelyingParty rp;
    
    @JsonProperty("user")
    private UserInfo user;
    
    @JsonProperty("pubKeyCredParams")
    private PubKeyCredParam[] pubKeyCredParams;
    
    @JsonProperty("authenticatorSelection")
    private AuthenticatorSelection authenticatorSelection;
    
    @JsonProperty("timeout")
    private long timeout;
    
    @JsonProperty("attestation")
    private String attestation;
    
    // Default constructor
    public RegistrationOptionsResponse() {}
    
    // Constructor
    public RegistrationOptionsResponse(String challenge, RelyingParty rp, UserInfo user, 
                                     PubKeyCredParam[] pubKeyCredParams, 
                                     AuthenticatorSelection authenticatorSelection, 
                                     long timeout, String attestation) {
        this.challenge = challenge;
        this.rp = rp;
        this.user = user;
        this.pubKeyCredParams = pubKeyCredParams;
        this.authenticatorSelection = authenticatorSelection;
        this.timeout = timeout;
        this.attestation = attestation;
    }
    
    // Getters and setters
    public String getChallenge() {
        return challenge;
    }
    
    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }
    
    public RelyingParty getRp() {
        return rp;
    }
    
    public void setRp(RelyingParty rp) {
        this.rp = rp;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    public PubKeyCredParam[] getPubKeyCredParams() {
        return pubKeyCredParams;
    }
    
    public void setPubKeyCredParams(PubKeyCredParam[] pubKeyCredParams) {
        this.pubKeyCredParams = pubKeyCredParams;
    }
    
    public AuthenticatorSelection getAuthenticatorSelection() {
        return authenticatorSelection;
    }
    
    public void setAuthenticatorSelection(AuthenticatorSelection authenticatorSelection) {
        this.authenticatorSelection = authenticatorSelection;
    }
    
    public long getTimeout() {
        return timeout;
    }
    
    public void setTimeout(long timeout) {
        this.timeout = timeout;
    }
    
    public String getAttestation() {
        return attestation;
    }
    
    public void setAttestation(String attestation) {
        this.attestation = attestation;
    }
    
    // Nested classes
    public static class RelyingParty {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
        
        public RelyingParty() {}
        
        public RelyingParty(String id, String name) {
            this.id = id;
            this.name = name;
        }
        
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
    }
    
    public static class UserInfo {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("displayName")
        private String displayName;
        
        public UserInfo() {}
        
        public UserInfo(String id, String name, String displayName) {
            this.id = id;
            this.name = name;
            this.displayName = displayName;
        }
        
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
    }
    
    public static class PubKeyCredParam {
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("alg")
        private int alg;
        
        public PubKeyCredParam() {}
        
        public PubKeyCredParam(String type, int alg) {
            this.type = type;
            this.alg = alg;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public int getAlg() {
            return alg;
        }
        
        public void setAlg(int alg) {
            this.alg = alg;
        }
    }
    
    public static class AuthenticatorSelection {
        @JsonProperty("authenticatorAttachment")
        private String authenticatorAttachment;
        
        @JsonProperty("userVerification")
        private String userVerification;
        
        @JsonProperty("requireResidentKey")
        private boolean requireResidentKey;
        
        public AuthenticatorSelection() {}
        
        public AuthenticatorSelection(String authenticatorAttachment, String userVerification, boolean requireResidentKey) {
            this.authenticatorAttachment = authenticatorAttachment;
            this.userVerification = userVerification;
            this.requireResidentKey = requireResidentKey;
        }
        
        public String getAuthenticatorAttachment() {
            return authenticatorAttachment;
        }
        
        public void setAuthenticatorAttachment(String authenticatorAttachment) {
            this.authenticatorAttachment = authenticatorAttachment;
        }
        
        public String getUserVerification() {
            return userVerification;
        }
        
        public void setUserVerification(String userVerification) {
            this.userVerification = userVerification;
        }
        
        public boolean isRequireResidentKey() {
            return requireResidentKey;
        }
        
        public void setRequireResidentKey(boolean requireResidentKey) {
            this.requireResidentKey = requireResidentKey;
        }
    }
}