package com.university.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BatchAssignRequest {
    
    @NotBlank(message = "Batch is required")
    @Size(max = 20, message = "Batch must not exceed 20 characters")
    private String batch;
    
    public BatchAssignRequest() {}
    
    public BatchAssignRequest(String batch) {
        this.batch = batch;
    }
    
    public String getBatch() {
        return batch;
    }
    
    public void setBatch(String batch) {
        this.batch = batch;
    }
}