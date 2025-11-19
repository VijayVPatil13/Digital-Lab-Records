# Quick Setup Guide

## Step 1: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

## Step 2: Configure Environment

Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lab-record-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a secure random string!

## Step 3: Start MongoDB

Make sure MongoDB is running:
- Local: `mongod` (if installed locally)
- Or use MongoDB Atlas (update MONGODB_URI)

## Step 4: Create Initial Users

### Option 1: Using curl

**Create Admin:**
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

**Create Faculty:**
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

**Create Student:**
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

### Option 2: Using Postman or similar tool

1. Start the server: `cd server && npm start`
2. Make POST request to `http://localhost:5000/api/auth/register`
3. Use the JSON body format shown above

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd server
npm start
```

### Terminal 2 - Frontend
```bash
cd client
npm start
```

## Step 6: Login

1. Open browser to `http://localhost:3000`
2. Login with one of the created users
3. Start using the system!

## Default Test Credentials

After running the registration commands above:

- **Admin**: admin@example.com / admin123
- **Faculty**: faculty@example.com / faculty123
- **Student**: student@example.com / student123

## Next Steps

1. **As Admin**: Create courses and enroll faculty
2. **As Faculty**: Create lab sessions for your courses
3. **As Student**: Submit lab work before deadlines

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Change PORT in `server/.env`
- Update API_URL in `client/src/utils/api.js` if needed

### CORS Issues
- Server is configured for `http://localhost:3000`
- Adjust CORS in `server/server.js` if using different port



