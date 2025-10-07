package com.university.attendance.dto;

public class LocationVerificationResponse {
    private boolean verified;
    private String message;
    private double distance;
    private double allowedRadius;
    private TeacherLocation teacherLocation;
    
    // Default constructor
    public LocationVerificationResponse() {}
    
    // Constructor
    public LocationVerificationResponse(boolean verified, String message, double distance, double allowedRadius) {
        this.verified = verified;
        this.message = message;
        this.distance = distance;
        this.allowedRadius = allowedRadius;
    }
    
    // Getters and setters
    public boolean isVerified() {
        return verified;
    }
    
    public void setVerified(boolean verified) {
        this.verified = verified;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public double getDistance() {
        return distance;
    }
    
    public void setDistance(double distance) {
        this.distance = distance;
    }
    
    public double getAllowedRadius() {
        return allowedRadius;
    }
    
    public void setAllowedRadius(double allowedRadius) {
        this.allowedRadius = allowedRadius;
    }
    
    public TeacherLocation getTeacherLocation() {
        return teacherLocation;
    }
    
    public void setTeacherLocation(TeacherLocation teacherLocation) {
        this.teacherLocation = teacherLocation;
    }
    
    // Inner class for teacher location
    public static class TeacherLocation {
        private double latitude;
        private double longitude;
        private String locationName;
        
        public TeacherLocation() {}
        
        public TeacherLocation(double latitude, double longitude, String locationName) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.locationName = locationName;
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
        
        public String getLocationName() {
            return locationName;
        }
        
        public void setLocationName(String locationName) {
            this.locationName = locationName;
        }
    }
}