package com.university.attendance.service;

import com.university.attendance.dto.LocationVerificationRequest;
import com.university.attendance.dto.LocationVerificationResponse;
import com.university.attendance.entity.ClassSession;
import com.university.attendance.repository.ClassSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LocationVerificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(LocationVerificationService.class);
    private static final double ALLOWED_RADIUS_METERS = 100.0; // 100 meters radius
    
    @Autowired
    private ClassSessionRepository classSessionRepository;
    
    /**
     * Verify student location against teacher's location
     */
    public LocationVerificationResponse verifyLocation(LocationVerificationRequest request) {
        try {
            logger.info("Starting location verification for student {} with code {}", request.getStudentId(), request.getAttendanceCode());
            
            // Find active session by attendance code - try multiple methods for robust lookup
            Optional<ClassSession> sessionOpt = classSessionRepository.findByAccessCodeAndIsActiveTrue(request.getAttendanceCode());
            
            // Fallback: try the existing method if the first one doesn't work
            if (!sessionOpt.isPresent()) {
                sessionOpt = classSessionRepository.findTopByAccessCodeOrderBySessionIDDesc(request.getAttendanceCode());
                // Additional check for active status
                if (sessionOpt.isPresent()) {
                    ClassSession tempSession = sessionOpt.get();
                    if (!Boolean.TRUE.equals(tempSession.getIsActive())) {
                        logger.warn("Session found but not active: {}", tempSession.getSessionID());
                        return new LocationVerificationResponse(false, "Attendance session is not currently active", 0, ALLOWED_RADIUS_METERS);
                    }
                } else {
                    logger.warn("No session found for attendance code: {}", request.getAttendanceCode());
                    return new LocationVerificationResponse(false, "No attendance session found for this code", 0, ALLOWED_RADIUS_METERS);
                }
            }
            
            ClassSession session = sessionOpt.get();
            logger.info("Found session {} for verification", session.getSessionID());
            
            // Get teacher's location from session
            Double teacherLat = session.getTeacherLatitude();
            Double teacherLon = session.getTeacherLongitude();
            
            logger.info("Teacher location: lat={}, lon={}, location={}", teacherLat, teacherLon, session.getLocation());
            logger.info("Student location: lat={}, lon={}", request.getLatitude(), request.getLongitude());
            
            // Quick check for identical coordinates (same device/location)
            if (teacherLat != null && teacherLon != null && 
                teacherLat.equals(request.getLatitude()) && teacherLon.equals(request.getLongitude())) {
                logger.info("Identical coordinates detected - same location");
                LocationVerificationResponse response = new LocationVerificationResponse(
                    true,
                    "Location verified! You are at the exact classroom location (0.0 meters).",
                    0.0,
                    ALLOWED_RADIUS_METERS
                );
                
                LocationVerificationResponse.TeacherLocation teacherLocation = 
                    new LocationVerificationResponse.TeacherLocation(teacherLat, teacherLon, session.getLocation());
                response.setTeacherLocation(teacherLocation);
                
                return response;
            }
            
            if (teacherLat == null || teacherLon == null) {
                // If no teacher location is set, use the first student's location as the reference point
                logger.warn("No teacher location set for session: {} - using student's location as classroom reference", session.getSessionID());
                teacherLat = request.getLatitude();
                teacherLon = request.getLongitude();
                
                // Update the session with the student's location as teacher location for future students
                session.setTeacherLatitude(teacherLat);
                session.setTeacherLongitude(teacherLon);
                session.setLocation("Classroom Location (Auto-detected)");
                classSessionRepository.save(session);
                
                logger.info("Set teacher location from student coordinates: lat={}, lon={}", teacherLat, teacherLon);
                
                // Return success immediately since student is defining the classroom location
                LocationVerificationResponse response = new LocationVerificationResponse(
                    true,
                    "Location verified! You are at the classroom reference point (0.0 meters).",
                    0.0,
                    ALLOWED_RADIUS_METERS
                );
                
                LocationVerificationResponse.TeacherLocation teacherLocation = 
                    new LocationVerificationResponse.TeacherLocation(teacherLat, teacherLon, session.getLocation());
                response.setTeacherLocation(teacherLocation);
                
                return response;
            }
            
            // Calculate distance using Haversine formula
            double distance = calculateDistance(
                request.getLatitude(), request.getLongitude(),
                teacherLat, teacherLon
            );
            
            logger.info("Distance calculation: Student({}, {}) to Teacher({}, {}) = {} meters", 
                request.getLatitude(), request.getLongitude(), teacherLat, teacherLon, distance);
            
            // Enhanced location verification with GPS accuracy considerations
            boolean isWithinRadius;
            String message;
            
            if (distance <= 50.0) {
                // Very close - definitely same location
                isWithinRadius = true;
                message = String.format("Location verified! You are %.1f meters from the classroom.", distance);
            } else if (distance <= ALLOWED_RADIUS_METERS) {
                // Within acceptable radius
                isWithinRadius = true;
                message = String.format("Location verified! You are %.1f meters from the classroom.", distance);
            } else if (distance <= 500.0) {
                // Might be GPS inaccuracy - allow with warning
                isWithinRadius = true;
                message = String.format("Location verified with GPS tolerance! Distance: %.1f meters (GPS accuracy may vary).", distance);
                logger.warn("Allowing location verification due to possible GPS inaccuracy. Distance: {} meters", distance);
            } else {
                // Too far - definitely not same location
                isWithinRadius = false;
                message = String.format("You are too far from the classroom (%.1f meters away). Please move closer.", distance);
            }
            
            LocationVerificationResponse response = new LocationVerificationResponse(
                isWithinRadius,
                message,
                distance,
                ALLOWED_RADIUS_METERS
            );
            
            // Set teacher location info
            LocationVerificationResponse.TeacherLocation teacherLocation = 
                new LocationVerificationResponse.TeacherLocation(teacherLat, teacherLon, session.getLocation());
            response.setTeacherLocation(teacherLocation);
            
            logger.info("Location verification for student {}: distance={}m, verified={}", 
                request.getStudentId(), distance, isWithinRadius);
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error verifying location for student: {}", request.getStudentId(), e);
            return new LocationVerificationResponse(false, "Location verification failed: " + e.getMessage(), 0, ALLOWED_RADIUS_METERS);
        }
    }
    
    /**
     * Calculate distance between two GPS coordinates using Haversine formula
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point  
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in meters
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Check for very similar coordinates first (GPS precision check)
        double latDiff = Math.abs(lat1 - lat2);
        double lonDiff = Math.abs(lon1 - lon2);
        
        // If coordinates are very similar (within GPS precision), consider them same location
        if (latDiff < 0.001 && lonDiff < 0.001) { // ~100 meters precision
            logger.info("Coordinates are very similar - considering same location");
            return 0.0; // Same location
        }
        
        final double EARTH_RADIUS_KM = 6371.0;
        
        // Convert latitude and longitude from degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);
        
        // Calculate differences
        double deltaLat = lat2Rad - lat1Rad;
        double deltaLon = lon2Rad - lon1Rad;
        
        // Apply Haversine formula
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLat / 2) * Math.sin(deltaLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // Distance in kilometers, convert to meters
        double distanceKm = EARTH_RADIUS_KM * c;
        return distanceKm * 1000; // Convert to meters
    }
}