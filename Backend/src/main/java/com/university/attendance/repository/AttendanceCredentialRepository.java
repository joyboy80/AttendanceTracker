package com.university.attendance.repository;

import com.university.attendance.entity.AttendanceCredential;
import com.university.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceCredentialRepository extends JpaRepository<AttendanceCredential, Long> {
    
    /**
     * Find an active credential by credential ID
     */
    Optional<AttendanceCredential> findByCredentialIdAndActiveTrue(String credentialId);
    
    /**
     * Find an active credential by user
     */
    Optional<AttendanceCredential> findByUserAndActiveTrue(User user);
    
    /**
     * Check if a user already has an active credential
     */
    boolean existsByUserAndActiveTrue(User user);
    
    /**
     * Check if a credential ID already exists
     */
    boolean existsByCredentialId(String credentialId);
}