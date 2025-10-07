package com.university.attendance.repository;

import com.university.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySessionID(Long sessionID);
    Optional<Attendance> findByStudentIDAndSessionID(Long studentID, Long sessionID);
    boolean existsByStudentIDAndSessionID(Long studentID, Long sessionID);
    List<Attendance> findByCourseCode(String courseCode);
    List<Attendance> findByCourseCodeIn(List<String> courseCodes);
}


