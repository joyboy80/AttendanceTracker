package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "teachers")
@PrimaryKeyJoinColumn(name = "teacherID")
public class Teacher extends User {
    
    @NotBlank(message = "Department is required")
    @Size(max = 100)
    @Column(name = "department", nullable = false)
    private String department;
    
    @NotBlank(message = "Designation is required")
    @Size(max = 100)
    @Column(name = "designation", nullable = false)
    private String designation;
    
    @Column(name = "photo")
    private String photo;
    
    // Constructors
    public Teacher() {
        super();
    }
    
    public Teacher(String firstName, String middleName, String lastName, String email, 
                   String phone, String username, String password, String department, 
                   String designation, String photo) {
        super(firstName, middleName, lastName, email, phone, username, password, UserRole.TEACHER);
        this.department = department;
        this.designation = designation;
        this.photo = photo;
    }
    
    // Getters and Setters
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getDesignation() {
        return designation;
    }
    
    public void setDesignation(String designation) {
        this.designation = designation;
    }
    
    public String getPhoto() {
        return photo;
    }
    
    public void setPhoto(String photo) {
        this.photo = photo;
    }
}
