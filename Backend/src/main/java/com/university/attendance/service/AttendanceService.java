package com.university.attendance.service;

import com.university.attendance.dto.GenerateCodeResponse;
import com.university.attendance.dto.StudentSessionResponse;
import com.university.attendance.entity.Attendance;
import com.university.attendance.entity.ClassSession;
import com.university.attendance.entity.SessionStatus;
import com.university.attendance.repository.AttendanceRepository;
import com.university.attendance.repository.ClassSessionRepository;
import com.university.attendance.repository.EnrollmentRepository;
import com.university.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;

@Service
public class AttendanceService {

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    public GenerateCodeResponse generateCode(String courseCode, String teacherName, String teacherUsername) {
        ClassSession session = new ClassSession();
        session.setCourseCode(courseCode);
        session.setScheduledTime(Instant.now());
        session.setDurationMinutes(0);
        session.setAccessCode(UUID.randomUUID().toString());
        session.setStatus(SessionStatus.ACTIVE);
        session.setIsActive(true);
        // Set a temporary expiry time of 10 minutes to allow students to see the session
        // This will be updated when teacher actually starts the attendance
        session.setExpiryTime(Instant.now().plusSeconds(600)); // 10 minutes from now
        session.setTeacherName(teacherName);
        session.setTeacherUsername(teacherUsername);
        classSessionRepository.save(session);
        return new GenerateCodeResponse(session.getAccessCode(), session.getSessionID());
    }

    public ClassSession startAttendance(Long sessionId, int durationSeconds) {
        Optional<ClassSession> sessionOpt = classSessionRepository.findById(sessionId);
        ClassSession session = sessionOpt.orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Check if attendance records already exist for this session
        List<Attendance> existingAttendances = attendanceRepository.findBySessionID(sessionId);
        
        Instant startTime;
        if (!existingAttendances.isEmpty()) {
            // If students have already marked attendance, keep the original scheduled time
            // to ensure their attendance remains valid
            startTime = session.getScheduledTime();
        } else {
            // If no one has marked attendance yet, update start time to now
            startTime = Instant.now();
            session.setScheduledTime(startTime);
        }
        
        // Set duration and expiry time
        int actualDuration = Math.min(durationSeconds, 120); // Max 120 seconds
        session.setDurationMinutes(actualDuration);
        session.setExpiryTime(startTime.plusSeconds(actualDuration));
        session.setIsActive(true);
        
        return classSessionRepository.save(session);
    }

    public Attendance markAttendance(String code, Long studentId, String courseCode) {
        ClassSession session = classSessionRepository
                .findTopByAccessCodeOrderBySessionIDDesc(code)
                .orElseThrow(() -> new RuntimeException("Invalid code"));
        
        // Check if session is active
        if (!SessionStatus.ACTIVE.equals(session.getStatus())) {
            throw new RuntimeException("Attendance session is not active");
        }
        
        // Check if session is paused
        if (!Boolean.TRUE.equals(session.getIsActive())) {
            throw new RuntimeException("Attendance session is currently paused");
        }
        
        if (session.getExpiryTime() == null || Instant.now().isAfter(session.getExpiryTime())) {
            throw new RuntimeException("Attendance session expired");
        }
        
        // Check if student already marked attendance for this session
        if (attendanceRepository.existsByStudentIDAndSessionID(studentId, session.getSessionID())) {
            throw new RuntimeException("You have already marked attendance for this session");
        }
        
        // Validate attendance time is within session window
        Instant now = Instant.now();
        Instant sessionStart = session.getScheduledTime();
        Instant sessionEnd = session.getExpiryTime();
        
        if (now.isBefore(sessionStart)) {
            throw new RuntimeException("Attendance session has not started yet");
        }
        
        if (now.isAfter(sessionEnd)) {
            throw new RuntimeException("Attendance session has expired");
        }
        
        Attendance attendance = new Attendance();
        attendance.setStudentID(studentId);
        attendance.setCourseCode(courseCode);
        attendance.setSessionID(session.getSessionID());
        attendance.setAttendanceCode(code);
        attendance.setTimestamp(now);
        attendance.setStatus("PRESENT");
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendees(Long sessionId) {
        return attendanceRepository.findBySessionID(sessionId);
    }
    
    public List<Map<String, Object>> getAttendeesWithDetails(Long sessionId) {
        // First get the session to check its time window
        Optional<ClassSession> sessionOpt = classSessionRepository.findById(sessionId);
        if (!sessionOpt.isPresent()) {
            System.out.println("DEBUG: Session not found for ID: " + sessionId);
            return new java.util.ArrayList<>();
        }
        
        ClassSession session = sessionOpt.get();
        Instant sessionStart = session.getScheduledTime();
        Instant sessionEnd = session.getExpiryTime();
        
        System.out.println("DEBUG: Session found - ID: " + sessionId + 
                          ", Start: " + sessionStart + 
                          ", End: " + sessionEnd + 
                          ", Code: " + session.getAccessCode());
        
        // Get all attendance records for this session
        List<Attendance> allAttendances = attendanceRepository.findBySessionID(sessionId);
        System.out.println("DEBUG: Found " + allAttendances.size() + " total attendance records for session " + sessionId);
        
        // Filter only records within the session's time window
        List<Attendance> validAttendances = allAttendances.stream()
            .filter(attendance -> {
                Instant attendanceTime = attendance.getTimestamp();
                boolean timeValid = (!attendanceTime.isBefore(sessionStart)) && 
                                  (!attendanceTime.isAfter(sessionEnd));
                boolean codeValid = attendance.getAttendanceCode().equals(session.getAccessCode());
                
                System.out.println("DEBUG: Attendance record - Time: " + attendanceTime + 
                                 ", Code: " + attendance.getAttendanceCode() + 
                                 ", TimeValid: " + timeValid + 
                                 ", CodeValid: " + codeValid + 
                                 ", StudentID: " + attendance.getStudentID());
                
                return timeValid && codeValid;
            })
            .collect(java.util.stream.Collectors.toList());
            
        System.out.println("DEBUG: " + validAttendances.size() + " valid attendance records after filtering");
        
        return validAttendances.stream().map(attendance -> {
            Map<String, Object> details = new HashMap<>();
            details.put("attendanceId", attendance.getAttendanceID());
            details.put("studentId", attendance.getStudentID());
            details.put("attendanceCode", attendance.getAttendanceCode());
            details.put("timestamp", attendance.getTimestamp());
            details.put("status", attendance.getStatus());
            details.put("createdAt", attendance.getTimestamp());
            details.put("sessionStart", sessionStart);
            details.put("sessionEnd", sessionEnd);
            
            // Get student details from User table
            try {
                var user = userRepository.findById(attendance.getStudentID());
                if (user.isPresent()) {
                    details.put("studentName", user.get().getFirstName() + " " + user.get().getLastName());
                    details.put("rollNumber", user.get().getUsername());
                } else {
                    details.put("studentName", "Unknown Student");
                    details.put("rollNumber", "N/A");
                }
            } catch (Exception e) {
                details.put("studentName", "Unknown Student");
                details.put("rollNumber", "N/A");
            }
            
            return details;
        }).collect(java.util.stream.Collectors.toList());
    }
    
    public Optional<ClassSession> getActiveSession(String courseCode) {
        return classSessionRepository.findTopByCourseCodeOrderBySessionIDDesc(courseCode)
                .filter(session -> SessionStatus.ACTIVE.equals(session.getStatus()) && 
                                 Boolean.TRUE.equals(session.getIsActive()) &&
                                 session.getExpiryTime() != null && 
                                 Instant.now().isBefore(session.getExpiryTime()));
    }
    
    public ClassSession stopSession(Long sessionId) {
        Optional<ClassSession> sessionOpt = classSessionRepository.findById(sessionId);
        ClassSession session = sessionOpt.orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setStatus(SessionStatus.ENDED);
        session.setEndTime(Instant.now());
        session.setIsActive(false);
        
        return classSessionRepository.save(session);
    }
    
    public ClassSession pauseSession(Long sessionId) {
        Optional<ClassSession> sessionOpt = classSessionRepository.findById(sessionId);
        ClassSession session = sessionOpt.orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!SessionStatus.ACTIVE.equals(session.getStatus())) {
            throw new RuntimeException("Cannot pause a session that is not active");
        }
        
        if (session.getExpiryTime() == null) {
            throw new RuntimeException("Cannot pause a session without expiry time");
        }
        
        // Calculate remaining time in seconds
        Instant now = Instant.now();
        long remainingSeconds = session.getExpiryTime().getEpochSecond() - now.getEpochSecond();
        
        if (remainingSeconds <= 0) {
            throw new RuntimeException("Cannot pause an expired session");
        }
        
        session.setIsActive(false);
        session.setRemainingTime((int) remainingSeconds);
        
        return classSessionRepository.save(session);
    }
    
    public ClassSession resumeSession(Long sessionId) {
        Optional<ClassSession> sessionOpt = classSessionRepository.findById(sessionId);
        ClassSession session = sessionOpt.orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!SessionStatus.ACTIVE.equals(session.getStatus())) {
            throw new RuntimeException("Cannot resume a session that is not active");
        }
        
        if (session.getRemainingTime() == null || session.getRemainingTime() <= 0) {
            throw new RuntimeException("Cannot resume a session with no remaining time");
        }
        
        // Recalculate end time based on remaining time
        Instant now = Instant.now();
        session.setExpiryTime(now.plusSeconds(session.getRemainingTime()));
        session.setIsActive(true);
        session.setRemainingTime(null); // Clear remaining time as session is now active
        
        return classSessionRepository.save(session);
    }
    
    public Optional<ClassSession> getCurrentActiveSession(String courseCode) {
        return classSessionRepository.findTopByCourseCodeOrderBySessionIDDesc(courseCode)
                .filter(session -> SessionStatus.ACTIVE.equals(session.getStatus()) && 
                                 Boolean.TRUE.equals(session.getIsActive()) &&
                                 session.getExpiryTime() != null && 
                                 Instant.now().isBefore(session.getExpiryTime()));
    }
    
    public Optional<StudentSessionResponse> getCurrentActiveSessionForStudent(String courseCode) {
        return getCurrentActiveSession(courseCode)
                .map(session -> new StudentSessionResponse(
                    session.getSessionID(),
                    session.getCourseCode(),
                    session.getAccessCode(),
                    session.getExpiryTime(),
                    session.getStatus(),
                    session.getIsActive(),
                    session.getTeacherName(),
                    session.getTeacherUsername(),
                    session.getRemainingTime()
                ));
    }
    
    public Optional<StudentSessionResponse> getCurrentActiveSessionForStudentId(Long studentId) {
        System.out.println("DEBUG: Finding active sessions for student ID: " + studentId);
        
        // First, get all courses the student is enrolled in
        List<String> enrolledCourses = enrollmentRepository.findCourseCodesByStudentId(studentId);
        System.out.println("DEBUG: Student enrolled in courses: " + enrolledCourses);
        
        if (enrolledCourses.isEmpty()) {
            System.out.println("DEBUG: Student not enrolled in any courses");
            return Optional.empty();
        }
        
        // Find any active session in the student's enrolled courses
        for (String courseCode : enrolledCourses) {
            Optional<ClassSession> activeSession = getCurrentActiveSession(courseCode);
            if (activeSession.isPresent()) {
                System.out.println("DEBUG: Found active session for course: " + courseCode + 
                                 ", Session ID: " + activeSession.get().getSessionID());
                ClassSession session = activeSession.get();
                return Optional.of(new StudentSessionResponse(
                    session.getSessionID(),
                    session.getCourseCode(),
                    session.getAccessCode(),
                    session.getExpiryTime(),
                    session.getStatus(),
                    session.getIsActive(),
                    session.getTeacherName(),
                    session.getTeacherUsername(),
                    session.getRemainingTime()
                ));
            }
        }
        
        System.out.println("DEBUG: No active sessions found for any enrolled courses");
        return Optional.empty();
    }
    
    public boolean isSessionActive(Long sessionId) {
        Optional<ClassSession> session = classSessionRepository.findById(sessionId);
        if (session.isPresent()) {
            ClassSession s = session.get();
            return SessionStatus.ACTIVE.equals(s.getStatus()) && 
                   Boolean.TRUE.equals(s.getIsActive()) &&
                   s.getExpiryTime() != null && 
                   Instant.now().isBefore(s.getExpiryTime());
        }
        return false;
    }
    
    public long getRemainingTime(Long sessionId) {
        Optional<ClassSession> session = classSessionRepository.findById(sessionId);
        if (session.isPresent()) {
            ClassSession s = session.get();
            if (s.getExpiryTime() != null) {
                long remaining = s.getExpiryTime().getEpochSecond() - Instant.now().getEpochSecond();
                return Math.max(0, remaining);
            }
        }
        return 0;
    }
    
    public ClassSession getSession(Long sessionId) {
        return classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }
    
    public Map<String, Object> getSessionStatistics(Long sessionId) {
        Map<String, Object> stats = new HashMap<>();
        
        Optional<ClassSession> sessionOpt = classSessionRepository.findById(sessionId);
        if (!sessionOpt.isPresent()) {
            stats.put("error", "Session not found");
            return stats;
        }
        
        ClassSession session = sessionOpt.get();
        List<Map<String, Object>> validAttendees = getAttendeesWithDetails(sessionId);
        
        stats.put("sessionId", sessionId);
        stats.put("sessionStart", session.getScheduledTime());
        stats.put("sessionEnd", session.getExpiryTime());
        stats.put("accessCode", session.getAccessCode());
        stats.put("totalAttendees", validAttendees.size());
        stats.put("isActive", isSessionActive(sessionId));
        stats.put("remainingTime", getRemainingTime(sessionId));
        
        return stats;
    }
    
    public List<ClassSession> getAllSessionsForCourse(String courseCode) {
        return classSessionRepository.findAll().stream()
                .filter(s -> courseCode.equals(s.getCourseCode()))
                .collect(java.util.stream.Collectors.toList());
    }
}


