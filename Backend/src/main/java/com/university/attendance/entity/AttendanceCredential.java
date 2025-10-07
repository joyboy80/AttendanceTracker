package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_credentials")
public class AttendanceCredential {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;
    
    @Column(name = "credential_id", unique = true, nullable = false, length = 512)
    @NotNull(message = "Credential ID is required")
    private String credentialId;
    
    @Column(name = "public_key", nullable = false)
    @Lob
    @NotNull(message = "Public key is required")
    private byte[] publicKey;
    
    @Column(name = "sign_count", nullable = false)
    private long signCount = 0;
    
    @Column(name = "active", nullable = false)
    private boolean active = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // JPA lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public AttendanceCredential() {}
    
    // Constructor with parameters
    public AttendanceCredential(User user, String credentialId, byte[] publicKey, long signCount) {
        this.user = user;
        this.credentialId = credentialId;
        this.publicKey = publicKey;
        this.signCount = signCount;
        this.active = true;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getCredentialId() {
        return credentialId;
    }
    
    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }
    
    public byte[] getPublicKey() {
        return publicKey;
    }
    
    public void setPublicKey(byte[] publicKey) {
        this.publicKey = publicKey;
    }
    
    public long getSignCount() {
        return signCount;
    }
    
    public void setSignCount(long signCount) {
        this.signCount = signCount;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}