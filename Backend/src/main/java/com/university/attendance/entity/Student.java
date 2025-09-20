package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "students")
@PrimaryKeyJoinColumn(name = "studentID")
public class Student extends User {
    
    @NotBlank(message = "Department is required")
    @Size(max = 100)
    @Column(name = "department", nullable = false)
    private String department;
    
    @NotBlank(message = "Batch is required")
    @Size(max = 20)
    @Column(name = "batch", nullable = false)
    private String batch;
    
    @Size(max = 10)
    @Column(name = "section")
    private String section;
    
    @Column(name = "photo")
    private String photo;
    
    // Constructors
    public Student() {
        super();
    }
    
    public Student(String firstName, String middleName, String lastName, String email, 
                   String phone, String username, String password, String department, 
                   String batch, String section, String photo) {
        super(firstName, middleName, lastName, email, phone, username, password, UserRole.STUDENT, batch);
        this.department = department;
        this.batch = batch;
        this.section = section;
        this.photo = photo;
    }
    
    // Getters and Setters
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getBatch() {
        return batch;
    }
    
    public void setBatch(String batch) {
        this.batch = batch;
    }
    
    public String getSection() {
        return section;
    }
    
    public void setSection(String section) {
        this.section = section;
    }
    
    public String getPhoto() {
        return photo;
    }
    
    public void setPhoto(String photo) {
        this.photo = photo;
    }
}
