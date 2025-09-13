# Smart Biometric Attendance Tracker System

A comprehensive attendance tracking system built with React frontend and Spring Boot backend, featuring JWT authentication and MySQL database integration.

## 🚀 Features

- **User Authentication**: Secure signup and signin with JWT tokens
- **Role-based Access Control**: Support for Students, Teachers, and Admin roles
- **Biometric Integration**: Framework for fingerprint and face recognition
- **Real-time Attendance**: Live attendance tracking during class sessions
- **Statistics Dashboard**: Comprehensive attendance analytics
- **Responsive Design**: Modern UI with Bootstrap and Font Awesome

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **Styling**: Bootstrap 5 + Font Awesome
- **State Management**: React Context API
- **Authentication**: JWT token-based

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security with JWT
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA
- **Validation**: Bean Validation

### Database (MySQL)
- **Engine**: MySQL 8.0
- **Schema**: Based on ER diagram with inheritance support
- **Relationships**: Many-to-Many for enrollments and assignments

## 📋 Prerequisites

- **Java**: 17 or higher
- **Node.js**: 16 or higher
- **MySQL**: 8.0 or higher
- **Maven**: 3.6 or higher

## 🛠️ Installation & Setup

### 1. Database Setup

1. **Install MySQL** and start the service
2. **Create Database**:
   ```sql
   mysql -u root -p
   source Backend/database_setup.sql
   ```

3. **Update Configuration** in `Backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/attendance_tracker?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
       username: your_username
       password: your_password
   ```

### 2. Backend Setup

1. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

2. **Build and Run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. **Navigate to Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## 🔐 Authentication System

### User Roles
- **STUDENT**: Can view attendance, statistics, and enroll in courses
- **TEACHER**: Can manage classes, activate attendance, and view student data
- **ADMIN**: Full system access for user and course management

### JWT Token Structure
```json
{
  "sub": "username",
  "iat": 1234567890,
  "exp": 1234567890,
  "authorities": ["ROLE_STUDENT"]
}
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### 1. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student1",

  
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "userID": 1,
    "username": "student1",
    "role": "STUDENT",
    "name": "John Michael Doe",
    "email": "john.doe@university.edu"
  }
}
```

#### 2. User Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "phone": "1234567890",
  "username": "student1",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "STUDENT",
  "department": "Computer Science",
  "batch": "2024",
  "section": "A"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "userID": 1,
    "username": "student1",
    "role": "STUDENT",
    "name": "John Michael Doe",
    "email": "john.doe@university.edu"
  }
}
```

#### 3. Test Endpoint
```http
GET /api/test/hello
```

**Response:**
```json
{
  "message": "Hello from Spring Boot!",
  "status": "success"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "Username is already taken"
}
```

#### 401 Unauthorized
```json
{
  "message": "Invalid username or password"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    userID BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    middleName VARCHAR(50),
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE
);
```

#### Students Table (Inherits from Users)
```sql
CREATE TABLE students (
    studentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    batch VARCHAR(20) NOT NULL,
    section VARCHAR(10),
    photo VARCHAR(255),
    FOREIGN KEY (studentID) REFERENCES users(userID) ON DELETE CASCADE
);
```

#### Teachers Table (Inherits from Users)
```sql
CREATE TABLE teachers (
    teacherID BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    photo VARCHAR(255),
    FOREIGN KEY (teacherID) REFERENCES users(userID) ON DELETE CASCADE
);
```

### Relationship Tables

#### Student-Course Enrollment (Many-to-Many)
```sql
CREATE TABLE student_course_enrollment (
    enrollmentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    studentID BIGINT NOT NULL,
    courseCode VARCHAR(20) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE
);
```

#### Teacher-Course Assignment (Many-to-Many)
```sql
CREATE TABLE teacher_course_assignment (
    assignmentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacherID BIGINT NOT NULL,
    courseCode VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherID) REFERENCES teachers(teacherID) ON DELETE CASCADE,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE
);
```

## 🔧 Configuration

### JWT Configuration
```yaml
jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000 # 24 hours
```

### CORS Configuration
```yaml
cors:
  allowed-origins: http://localhost:3000,http://localhost:5173
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

## 🧪 Testing

### Demo Accounts
- **Student**: `student1` / `password`
- **Teacher**: `teacher1` / `password`
- **Admin**: `admin1` / `password`

### API Testing with cURL

#### Login Test
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password"}'
```

#### Signup Test
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "username":"testuser",
    "password":"password123",
    "confirmPassword":"password123",
    "role":"STUDENT",
    "department":"Computer Science",
    "batch":"2024"
  }'
```

## 🚀 Deployment

### Backend Deployment
1. Build JAR file: `mvn clean package`
2. Run: `java -jar target/attendance-tracker-0.0.1-SNAPSHOT.jar`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `dist` folder to your web server

## 📝 Development Notes

### Security Features
- Password hashing with BCrypt
- JWT token expiration
- CORS configuration
- Input validation
- SQL injection prevention

### Future Enhancements
- Biometric device integration
- Real-time notifications
- Mobile app support
- Advanced reporting
- Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@university.edu or create an issue in the repository.

---

**Built with ❤️ for University Attendance Management**
