# Digital Lab Record System

A comprehensive three-tier application for managing lab records with role-based access control (Admin, Faculty, Student) using MongoDB, Express, React, and JWT authentication.

## Features

- **Role-Based Access Control**: Admin, Faculty, and Student roles with different permissions
- **Course Management**: Admins can create courses and assign faculty
- **Lab Session Management**: Faculty can create lab sessions with deadlines
- **Submission System**: Students can submit lab work before deadlines
- **Review System**: Faculty can review and grade student submissions
- **JWT Authentication**: Secure token-based authentication
- **Modern UI**: Built with React and Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

### Frontend
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ElectronicLabJournal
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lab-record-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in the `.env` file.

## Running the Application

### Start the Backend Server

```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### Start the Frontend

```bash
cd client
npm start
```

The frontend will run on `http://localhost:3000`

## Initial Setup

### Create Admin User

You can create an admin user using the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "Admin",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Or use a tool like Postman to make the request.

### Create Faculty and Student Users

Similarly, you can create faculty and student users:

**Faculty:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty@example.com",
    "password": "faculty123",
    "role": "Faculty",
    "firstName": "John",
    "lastName": "Professor"
  }'
```

**Student:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "student123",
    "role": "Student",
    "firstName": "Jane",
    "lastName": "Student"
  }'
```

## Usage Guide

### Admin Workflow

1. Login as Admin
2. Create courses (e.g., "CHEM101 - General Chemistry")
3. Enroll faculty members to courses
4. View all users and courses

### Faculty Workflow

1. Login as Faculty
2. View assigned courses
3. Create lab sessions with:
   - Course selection
   - Lab name
   - Start and end dates (deadline)
4. View student submissions for each lab
5. Review and grade submissions with feedback

### Student Workflow

1. Login as Student
2. View enrolled courses
3. View available lab sessions
4. Submit lab work before the deadline
5. View submission status and grades
6. Update submissions if deadline hasn't passed

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Admin Routes (Requires Admin role)
- `GET /api/admin/courses` - Get all courses
- `POST /api/admin/courses` - Create new course
- `POST /api/admin/enrollfaculty` - Enroll faculty in course
- `GET /api/admin/users` - Get all users

### Faculty Routes (Requires Faculty role)
- `GET /api/faculty/courses` - Get assigned courses
- `GET /api/faculty/labsessions` - Get all lab sessions
- `POST /api/faculty/labsessions` - Create lab session
- `GET /api/faculty/submissions/:labId` - Get submissions for a lab
- `PATCH /api/faculty/review/:subId` - Review a submission

### Student Routes (Requires Student role)
- `GET /api/student/courses` - Get enrolled courses
- `GET /api/student/labsessions` - Get lab sessions
- `POST /api/student/submit/:labId` - Submit/update lab work
- `GET /api/student/submissions` - Get own submissions

## Database Schema

### Users Collection
- `_id`: ObjectId
- `email`: String (unique)
- `passwordHash`: String
- `role`: Enum (Admin, Faculty, Student)
- `firstName`: String
- `lastName`: String
- `enrolledCourses`: Array of ObjectIds (references to Courses)

### Courses Collection
- `_id`: ObjectId
- `name`: String
- `code`: String (unique)
- `facultyAssigned`: Array of ObjectIds (references to Users)

### LabSessions Collection
- `_id`: ObjectId
- `courseId`: ObjectId (reference to Course)
- `name`: String
- `startDate`: Date
- `endDate`: Date
- `facultyId`: ObjectId (reference to User)

### Submissions Collection
- `_id`: ObjectId
- `labSessionId`: ObjectId (reference to LabSession)
- `studentId`: ObjectId (reference to User)
- `submissionText`: String
- `submittedAt`: Date
- `status`: Enum (Pending, Reviewed, Needs Revision)
- `review`: Object
  - `grade`: String
  - `feedback`: String
  - `reviewedBy`: ObjectId
  - `reviewedAt`: Date

## Security Features

- Password hashing with Bcrypt
- JWT token-based authentication
- Role-based authorization middleware
- Protected API routes
- Token expiration (7 days)

## Development

### Project Structure

```
ElectronicLabJournal/
├── server/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/     # Auth middleware
│   ├── server.js        # Express server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utilities
│   │   └── styles/     # CSS files
│   └── package.json
└── README.md
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### CORS Issues
- The server is configured to allow CORS from `http://localhost:3000`
- Adjust CORS settings in `server.js` if needed

### Authentication Issues
- Check that JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header
- Check token expiration

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.



