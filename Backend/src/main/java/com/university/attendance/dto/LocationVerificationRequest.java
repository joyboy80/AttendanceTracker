package com.university.attendance.dto;

public class LocationVerificationRequest {
    private Long studentId;
    private double latitude;
    private double longitude;
    private String attendanceCode;
    
    // Default constructor
    public LocationVerificationRequest() {}
    
    // Constructor
    public LocationVerificationRequest(Long studentId, double latitude, double longitude, String attendanceCode) {
        this.studentId = studentId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.attendanceCode = attendanceCode;
    }
    
    // Getters and setters
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    
    public double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }
    
    public double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
    
    public String getAttendanceCode() {
        return attendanceCode;
    }
    
    public void setAttendanceCode(String attendanceCode) {
        this.attendanceCode = attendanceCode;
    }
}