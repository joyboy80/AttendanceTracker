package com.university.attendance.controller;

import com.university.attendance.dto.GenerateCodeResponse;
import com.university.attendance.entity.Attendance;
import com.university.attendance.entity.ClassSession;
import com.university.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private com.university.attendance.service.LocationVerificationService locationVerificationService;
    
    @Autowired
    private com.university.attendance.repository.ClassSessionRepository classSessionRepository;

    @PostMapping("/generate")
    public ResponseEntity<GenerateCodeResponse> generate(@RequestParam String courseCode, 
                                                         @RequestParam String teacherName, 
                                                         @RequestParam String teacherUsername) {
        return ResponseEntity.ok(attendanceService.generateCode(courseCode, teacherName, teacherUsername));
    }

    @PostMapping("/start")
    public ResponseEntity<ClassSession> start(@RequestParam Long sessionId, 
                                              @RequestParam int duration,
                                              @RequestParam(required = false) Double teacherLatitude,
                                              @RequestParam(required = false) Double teacherLongitude,
                                              @RequestParam(required = false) String location) {
        System.out.println("🎯 CONTROLLER: Received start request - sessionId: " + sessionId + 
                          ", duration: " + duration + ", lat: " + teacherLatitude + 
                          ", lon: " + teacherLongitude + ", location: " + location);
        
        ClassSession result = attendanceService.startAttendance(sessionId, duration, teacherLatitude, teacherLongitude, location);
        
        System.out.println("🎯 CONTROLLER: Session started with saved location - lat: " + 
                          result.getTeacherLatitude() + ", lon: " + result.getTeacherLongitude() + 
                          ", location: " + result.getLocation());
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/mark")
    public ResponseEntity<?> mark(@RequestParam String code, @RequestParam Long studentId, @RequestParam String courseCode) {
        Attendance a = attendanceService.markAttendance(code, studentId, courseCode);
        Map<String, Object> res = new HashMap<>();
        res.put("attendanceId", a.getAttendanceID());
        res.put("status", a.getStatus());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/attendees")
    public ResponseEntity<List<Attendance>> attendees(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getAttendees(sessionId));
    }
    
    @GetMapping("/attendees-details")
    public ResponseEntity<List<Map<String, Object>>> getAttendeesWithDetails(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getAttendeesWithDetails(sessionId));
    }
    
    @GetMapping("/active-session")
    public ResponseEntity<?> getActiveSession(@RequestParam String courseCode) {
        return attendanceService.getActiveSession(courseCode)
                .map(session -> ResponseEntity.ok(session))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/active")
    public ResponseEntity<?> getActiveSessionForAttendance(@RequestParam String courseCode) {
        return attendanceService.getCurrentActiveSessionForStudent(courseCode)
                .map(session -> ResponseEntity.ok(session))
                .orElse(ResponseEntity.ok(null));
    }
    
    @GetMapping("/active-for-student")
    public ResponseEntity<?> getActiveSessionForStudent(@RequestParam Long studentId) {
        System.out.println("DEBUG: Getting active session for student ID: " + studentId);
        return attendanceService.getCurrentActiveSessionForStudentId(studentId)
                .map(session -> {
                    System.out.println("DEBUG: Found session: " + session.getSessionID() + " for course: " + session.getCourseCode());
                    return ResponseEntity.ok(session);
                })
                .orElse(ResponseEntity.ok(null));
    }
    
    @PostMapping("/stop")
    public ResponseEntity<?> stopSession(@RequestParam Long sessionId) {
        try {
            ClassSession stoppedSession = attendanceService.stopSession(sessionId);
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", stoppedSession.getSessionID());
            response.put("status", stoppedSession.getStatus());
            response.put("endTime", stoppedSession.getEndTime());
            response.put("message", "Session stopped successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/pause")
    public ResponseEntity<?> pauseSession(@RequestParam Long sessionId) {
        try {
            ClassSession pausedSession = attendanceService.pauseSession(sessionId);
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", pausedSession.getSessionID());
            response.put("isActive", pausedSession.getIsActive());
            response.put("remainingTime", pausedSession.getRemainingTime());
            response.put("message", "Session paused successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/resume")
    public ResponseEntity<?> resumeSession(@RequestParam Long sessionId) {
        try {
            ClassSession resumedSession = attendanceService.resumeSession(sessionId);
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", resumedSession.getSessionID());
            response.put("isActive", resumedSession.getIsActive());
            response.put("expiryTime", resumedSession.getExpiryTime());
            response.put("message", "Session resumed successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/session-status")
    public ResponseEntity<Map<String, Object>> getSessionStatus(@RequestParam Long sessionId) {
        Map<String, Object> response = new HashMap<>();
        boolean isActive = attendanceService.isSessionActive(sessionId);
        long remainingTime = attendanceService.getRemainingTime(sessionId);
        response.put("isActive", isActive);
        response.put("remainingTime", remainingTime);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/session-details")
    public ResponseEntity<ClassSession> getSessionDetails(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getSession(sessionId));
    }
    
    @GetMapping("/session-statistics")
    public ResponseEntity<Map<String, Object>> getSessionStatistics(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getSessionStatistics(sessionId));
    }
    
    @GetMapping("/debug-sessions")
    public ResponseEntity<Map<String, Object>> debugSessions(@RequestParam String courseCode) {
        Map<String, Object> debug = new HashMap<>();
        
        debug.put("courseCode", courseCode);
        debug.put("currentTime", java.time.Instant.now());
        
        // Get what the active session query returns
        Optional<ClassSession> activeSession = attendanceService.getActiveSession(courseCode);
        debug.put("activeSessionFound", activeSession.isPresent());
        if (activeSession.isPresent()) {
            ClassSession session = activeSession.get();
            debug.put("activeSession", Map.of(
                "sessionID", session.getSessionID(),
                "status", session.getStatus(),
                "isActive", session.getIsActive(),
                "expiryTime", session.getExpiryTime(),
                "teacherName", session.getTeacherName(),
                "accessCode", session.getAccessCode()
            ));
            
            // Also check attendees for this session
            List<Map<String, Object>> attendees = attendanceService.getAttendeesWithDetails(session.getSessionID());
            debug.put("attendeesCount", attendees.size());
            debug.put("attendees", attendees);
        }
        
        return ResponseEntity.ok(debug);
    }
    
    @PostMapping("/test-flow")
    public ResponseEntity<Map<String, Object>> testCompleteFlow(@RequestParam String teacherName, 
                                                               @RequestParam String teacherUsername) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Step 1: Generate code
            GenerateCodeResponse codeResponse = attendanceService.generateCode("CS101", teacherName, teacherUsername);
            result.put("step1_generate", Map.of(
                "success", true,
                "sessionId", codeResponse.getSessionId(),
                "accessCode", codeResponse.getCode()
            ));
            
            // Step 2: Start attendance
            ClassSession session = attendanceService.startAttendance(codeResponse.getSessionId(), 180);
            result.put("step2_start", Map.of(
                "success", true,
                "expiryTime", session.getExpiryTime(),
                "isActive", session.getIsActive()
            ));
            
            // Step 3: Check if students can detect
            Optional<com.university.attendance.dto.StudentSessionResponse> studentSession = 
                attendanceService.getCurrentActiveSessionForStudent("CS101");
            result.put("step3_student_detection", Map.of(
                "success", studentSession.isPresent(),
                "sessionFound", studentSession.isPresent()
            ));
            
            result.put("overall", "SUCCESS - Complete flow working");
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("overall", "FAILED");
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/verify-location")
    public ResponseEntity<?> verifyLocation(@RequestBody com.university.attendance.dto.LocationVerificationRequest request) {
        try {
            com.university.attendance.dto.LocationVerificationResponse response = 
                locationVerificationService.verifyLocation(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("verified", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/debug-session-location")
    public ResponseEntity<Map<String, Object>> debugSessionLocation(@RequestParam String accessCode) {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            Optional<ClassSession> sessionOpt = attendanceService.getActiveSession(accessCode);
            if (sessionOpt.isPresent()) {
                ClassSession session = sessionOpt.get();
                debug.put("sessionFound", true);
                debug.put("sessionId", session.getSessionID());
                debug.put("accessCode", session.getAccessCode());
                debug.put("isActive", session.getIsActive());
                debug.put("teacherLatitude", session.getTeacherLatitude());
                debug.put("teacherLongitude", session.getTeacherLongitude());
                debug.put("location", session.getLocation());
                debug.put("teacherName", session.getTeacherName());
            } else {
                debug.put("sessionFound", false);
                debug.put("message", "No active session found for code: " + accessCode);
            }
        } catch (Exception e) {
            debug.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(debug);
    }
    
    @PostMapping("/test-location-save")
    public ResponseEntity<Map<String, Object>> testLocationSave() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Generate a test session
            GenerateCodeResponse codeResponse = attendanceService.generateCode("TEST101", "Test Teacher", "test_teacher");
            result.put("step1_generate", "Session generated: " + codeResponse.getSessionId());
            
            // Start with location
            double testLat = 40.7589; // Times Square coordinates for testing
            double testLon = -73.9851;
            String testLocation = "Test Classroom";
            
            ClassSession session = attendanceService.startAttendance(
                codeResponse.getSessionId(), 
                180, 
                testLat, 
                testLon, 
                testLocation
            );
            
            result.put("step2_start", "Session started with location");
            result.put("savedLatitude", session.getTeacherLatitude());
            result.put("savedLongitude", session.getTeacherLongitude());
            result.put("savedLocation", session.getLocation());
            result.put("sessionId", session.getSessionID());
            result.put("accessCode", session.getAccessCode());
            
            // Verify it's saved properly
            Optional<ClassSession> retrievedOpt = attendanceService.getActiveSession("TEST101");
            if (retrievedOpt.isPresent()) {
                ClassSession retrieved = retrievedOpt.get();
                result.put("step3_verify", "Location retrieved successfully");
                result.put("retrievedLatitude", retrieved.getTeacherLatitude());
                result.put("retrievedLongitude", retrieved.getTeacherLongitude());
                result.put("retrievedLocation", retrieved.getLocation());
            } else {
                result.put("step3_verify", "Failed to retrieve session");
            }
            
            result.put("status", "SUCCESS");
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("status", "FAILED");
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/update-session-location")
    public ResponseEntity<Map<String, Object>> updateSessionLocation(@RequestParam Long sessionId,
                                                                     @RequestParam Double latitude,
                                                                     @RequestParam Double longitude,
                                                                     @RequestParam(required = false) String location) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🎯 MANUAL UPDATE: Updating session " + sessionId + " with lat: " + latitude + ", lon: " + longitude);
            
            Optional<ClassSession> sessionOpt = attendanceService.getActiveSession("CS101"); // This might need the actual course code
            if (!sessionOpt.isPresent()) {
                // Try to get by ID directly
                ClassSession session = attendanceService.getSession(sessionId);
                session.setTeacherLatitude(latitude);
                session.setTeacherLongitude(longitude);
                if (location != null) {
                    session.setLocation(location);
                }
                
                // Save using repository directly
                ClassSession updatedSession = classSessionRepository.save(session);
                
                response.put("success", true);
                response.put("message", "Location updated successfully");
                response.put("sessionId", updatedSession.getSessionID());
                response.put("updatedLatitude", updatedSession.getTeacherLatitude());
                response.put("updatedLongitude", updatedSession.getTeacherLongitude());
                response.put("updatedLocation", updatedSession.getLocation());
                
            } else {
                response.put("success", false);
                response.put("message", "Session not found");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(response);
    }
}


