package com.university.attendance.dto;

public class GenerateCodeResponse {
    private String code;
    private Long sessionId;

    public GenerateCodeResponse(String code, Long sessionId) {
        this.code = code;
        this.sessionId = sessionId;
    }

    public String getCode() { return code; }
    public Long getSessionId() { return sessionId; }
}


