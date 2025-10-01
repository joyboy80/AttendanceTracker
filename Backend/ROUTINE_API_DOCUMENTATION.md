# Routine API Endpoints Documentation

## 1. POST /api/routine

### Description
Creates a new routine with validation for CourseID, Username (teacher), and StudentBatch.

### Request Body Example
```json
{
    "courseId": 1,
    "courseTime": "09:00",
    "day": "Monday",
    "username": "dr_smith",
    "studentBatch": "CSE-2021"
}
```

### Validation Rules
1. **CourseID**: Must exist in Course table
2. **Username**: Must exist in Teacher table (retrieves TeacherID automatically)
3. **StudentBatch**: Must exist in Student table
4. **CourseTime**: Must be in HH:MM format (e.g., "09:00", "14:30")
5. **Day**: Required field for day of week
6. **Duplicate Check**: No duplicate routine for same course, day, time, and batch

### Success Response
```json
{
    "success": true,
    "message": "Routine created successfully",
    "routine": {
        "routineId": 1,
        "courseId": 1,
        "courseCode": "CSE101",
        "courseTitle": "Introduction to Programming",
        "courseTime": "09:00:00",
        "day": "Monday",
        "teacherId": 5,
        "teacherName": "Dr. John Smith",
        "teacherUsername": "dr_smith",
        "studentBatch": "CSE-2021",
        "createdAt": "2025-09-20T10:30:00"
    }
}
```

### Error Responses

#### CourseID not found
```json
{
    "success": false,
    "message": "CourseID not found in Course table"
}
```

#### Username not found
```json
{
    "success": false,
    "message": "Username 'dr_smith' not found in Teacher table"
}
```

#### StudentBatch not found
```json
{
    "success": false,
    "message": "StudentBatch 'CSE-2021' not found in Student table"
}
```

#### Invalid time format
```json
{
    "success": false,
    "message": "Invalid CourseTime format. Use HH:MM (e.g., 09:00, 14:30)"
}
```

#### Duplicate routine
```json
{
    "success": false,
    "message": "Routine already exists for this CourseID, Day, CourseTime and StudentBatch combination"
}
```

### Usage
```bash
curl -X POST http://localhost:8080/api/routine \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "courseTime": "09:00",
    "day": "Monday", 
    "username": "dr_smith",
    "studentBatch": "CSE-2021"
  }'
```

## 2. GET /api/routine/student/{studentId}

### Description
Fetches the weekly schedule for a specific student based on their batch. The endpoint automatically retrieves the student's batch from the Student table and returns all routines for that batch.

### URL Parameters
- `studentId` (Long): The unique ID of the student

### Success Response
```json
{
    "success": true,
    "message": "Student routine retrieved successfully",
    "studentId": 123,
    "studentBatch": "CSE-2021",
    "weeklySchedule": [
        {
            "day": "Monday",
            "courseTime": "09:00:00",
            "courseTitle": "Introduction to Programming",
            "teacherName": "Dr. John Smith",
            "courseCode": "CSE101",
            "routineId": 1,
            "studentBatch": "CSE-2021"
        },
        {
            "day": "Monday",
            "courseTime": "11:00:00",
            "courseTitle": "Data Structures",
            "teacherName": "Dr. Jane Doe",
            "courseCode": "CSE201",
            "routineId": 2,
            "studentBatch": "CSE-2021"
        },
        {
            "day": "Tuesday",
            "courseTime": "10:00:00",
            "courseTitle": "Database Systems",
            "teacherName": "Prof. Mike Johnson",
            "courseCode": "CSE301",
            "routineId": 3,
            "studentBatch": "CSE-2021"
        }
    ]
}
```

### Error Response

#### Student not found
```json
{
    "success": false,
    "message": "Student with ID 123 not found"
}
```

### Features
1. **Automatic Batch Lookup**: Retrieves student's batch from Student table
2. **Complete Schedule**: Returns all routines for the student's batch
3. **Ordered Results**: Routines are ordered by day and time
4. **Rich Data**: Includes course details, teacher information, and schedule timing

### Usage
```bash
curl -X GET http://localhost:8080/api/routine/student/123 \
  -H "Content-Type: application/json"
```

### Use Cases
- Student portal displaying weekly schedule
- Mobile apps showing student timetable
- Academic planning and scheduling systems
- Attendance tracking applications

## 3. GET /api/routine/teacher/{teacherId}

### Description
Fetches the weekly schedule for a specific teacher. The endpoint returns all routines assigned to the teacher, including course details and student batch information.

### URL Parameters
- `teacherId` (Long): The unique ID of the teacher

### Success Response
```json
{
    "success": true,
    "message": "Teacher routine retrieved successfully",
    "teacherId": 5,
    "teacherName": "Dr. John Smith",
    "teacherUsername": "dr_smith",
    "weeklySchedule": [
        {
            "day": "Monday",
            "courseTime": "09:00:00",
            "courseTitle": "Introduction to Programming",
            "studentBatch": "CSE-2021",
            "courseCode": "CSE101",
            "routineId": 1,
            "teacherName": "Dr. John Smith"
        },
        {
            "day": "Monday",
            "courseTime": "14:00:00",
            "courseTitle": "Advanced Programming",
            "studentBatch": "CSE-2020",
            "courseCode": "CSE201",
            "routineId": 4,
            "teacherName": "Dr. John Smith"
        },
        {
            "day": "Wednesday",
            "courseTime": "10:00:00",
            "courseTitle": "Software Engineering",
            "studentBatch": "CSE-2019",
            "courseCode": "CSE401",
            "routineId": 7,
            "teacherName": "Dr. John Smith"
        }
    ]
}
```

### Error Response

#### Teacher not found
```json
{
    "success": false,
    "message": "Teacher with ID 5 not found"
}
```

### Features
1. **Teacher Validation**: Verifies teacher exists in database
2. **Complete Schedule**: Returns all routines assigned to the teacher
3. **Ordered Results**: Routines are ordered by day and time
4. **Rich Data**: Includes course details, student batch, and schedule timing
5. **Teacher Info**: Returns teacher name and username in response

### Usage
```bash
curl -X GET http://localhost:8080/api/routine/teacher/5 \
  -H "Content-Type: application/json"
```

### Use Cases
- Teacher portal displaying weekly teaching schedule
- Academic workload management systems
- Class scheduling and room allocation
- Teacher attendance and performance tracking