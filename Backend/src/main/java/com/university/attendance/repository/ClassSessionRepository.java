package com.university.attendance.repository;

import com.university.attendance.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    Optional<ClassSession> findTopByAccessCodeOrderBySessionIDDesc(String accessCode);
    Optional<ClassSession> findTopByCourseCodeOrderBySessionIDDesc(String courseCode);
}


