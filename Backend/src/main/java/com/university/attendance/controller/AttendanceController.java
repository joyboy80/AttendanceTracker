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

    @PostMapping("/generate")
    public ResponseEntity<GenerateCodeResponse> generate(@RequestParam String courseCode, 
                                                         @RequestParam String teacherName, 
                                                         @RequestParam String teacherUsername) {
        return ResponseEntity.ok(attendanceService.generateCode(courseCode, teacherName, teacherUsername));
    }

    @PostMapping("/start")
    public ResponseEntity<ClassSession> start(@RequestParam Long sessionId, @RequestParam int duration) {
        return ResponseEntity.ok(attendanceService.startAttendance(sessionId, duration));
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
            ClassSession session = attendanceService.startAttendance(codeResponse.getSessionId(), 120);
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
}


