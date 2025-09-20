package com.university.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID")
    private Long userID;
    
    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Column(name = "name", nullable = false)
    private String name;
    
    @NotBlank(message = "First name is required")
    @Size(max = 50)
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Size(max = 50)
    @Column(name = "middle_name")
    private String middleName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Email(message = "Email should be valid")
    @Size(max = 100)
    @Column(name = "email")
    private String email;
    
    @Size(max = 20)
    @Column(name = "phone")
    private String phone;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(name = "username", unique = true, nullable = false)
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(name = "password", nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;
    
    @Size(max = 20)
    @Column(name = "batch")
    private String batch;
    
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;
    
    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired = true;
    
    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked = true;
    
    @Column(name = "credentials_non_expired", nullable = false)
    private boolean credentialsNonExpired = true;
    
    // Constructors
    public User() {}
    
    public User(String firstName, String middleName, String lastName, String email, 
                String phone, String username, String password, UserRole role, String batch) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.name = firstName + (middleName != null ? " " + middleName : "") + " " + lastName;
        this.email = email;
        this.phone = phone;
        this.username = username;
        this.password = password;
        this.role = role;
        this.batch = batch;
    }
    
    // Getters and Setters
    public Long getUserID() {
        return userID;
    }
    
    public void setUserID(Long userID) {
        this.userID = userID;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getMiddleName() {
        return middleName;
    }
    
    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public String getBatch() {
        return batch;
    }
    
    public void setBatch(String batch) {
        this.batch = batch;
    }
    
    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public void setAccountNonExpired(boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
    }
    
    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }
    
    public void setCredentialsNonExpired(boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
    }
}
