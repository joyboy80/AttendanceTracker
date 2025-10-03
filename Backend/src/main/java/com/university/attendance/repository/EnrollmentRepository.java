package com.university.attendance.repository;

import com.university.attendance.entity.Enrollment;
import com.university.attendance.entity.EnrollmentRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    List<Enrollment> findByUserIdAndRole(Long userId, EnrollmentRole role);
    
    List<Enrollment> findByCourseId(Long courseId);
    
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    
    @Query("SELECT e FROM Enrollment e JOIN Course c ON e.courseId = c.id WHERE e.userId = :userId AND e.role = :role")
    List<Enrollment> findEnrollmentsWithCoursesByUserIdAndRole(@Param("userId") Long userId, @Param("role") EnrollmentRole role);
    
    @Query("SELECT c.code FROM Enrollment e JOIN Course c ON e.courseId = c.id WHERE e.userId = :studentId AND e.role = 'STUDENT'")
    List<String> findCourseCodesByStudentId(@Param("studentId") Long studentId);
}