package com.university.attendance.repository;

import com.university.attendance.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {

    // Find routines by teacher ID
    List<Routine> findByTeacher_UserID(Long teacherId);

    // Find routines by student batch
    List<Routine> findByStudentBatch(String studentBatch);

    // Find routines by teacher and day
    List<Routine> findByTeacher_UserIDAndDay(Long teacherId, String day);

    // Find routines by batch and day
    List<Routine> findByStudentBatchAndDay(String studentBatch, String day);

    // Find routines by course ID
    List<Routine> findByCourse_Id(Long courseId);

    // Custom query to find routines with course and teacher details
    @Query("SELECT r FROM Routine r " +
           "JOIN FETCH r.course c " +
           "JOIN FETCH r.teacher t " +
           "WHERE r.teacher.userID = :teacherId " +
           "ORDER BY r.day, r.courseTime")
    List<Routine> findRoutinesWithDetailsForTeacher(@Param("teacherId") Long teacherId);

    // Custom query to find routines with course and teacher details by batch
    @Query("SELECT r FROM Routine r " +
           "JOIN FETCH r.course c " +
           "JOIN FETCH r.teacher t " +
           "WHERE r.studentBatch = :studentBatch " +
           "ORDER BY r.day, r.courseTime")
    List<Routine> findRoutinesWithDetailsForBatch(@Param("studentBatch") String studentBatch);

    // Check if a routine already exists for the same course, day, time and batch (to prevent duplicates)
    boolean existsByCourse_IdAndDayAndCourseTimeAndStudentBatch(
        Long courseId, String day, java.time.LocalTime courseTime, String studentBatch);

    // Find all routines ordered by day and time
    @Query("SELECT r FROM Routine r " +
           "JOIN FETCH r.course c " +
           "JOIN FETCH r.teacher t " +
           "ORDER BY r.day, r.courseTime")
    List<Routine> findAllWithDetails();
}