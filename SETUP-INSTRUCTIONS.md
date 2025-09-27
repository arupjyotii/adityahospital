# Aditya Hospital - Setup Instructions

## Quick Start

### 1. Database Setup Options

#### Option A: MongoDB Atlas (Cloud - Recommended for Production)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`)
4. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

#### Option B: Local MongoDB Installation
1. Download and install MongoDB from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```
3. Use local connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/aditya_hospital
   ```

### 2. Environment Configuration

1. Copy `.env.example` to `.env` (if not already done)
2. Update the following variables:
   ```
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=b7e2f8c1-4d3a-4e9b-9c2a-7f6e5d4c3b2a
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database with Sample Data

```bash
node server/init-db.js
```

This will create:
- Default admin user (username: `admin`, password: `admin123`)
- Sample departments (Cardiology, Orthopedics, etc.)
- Sample doctors and services

### 5. Start the Application

#### Development Mode (Frontend + Backend)
```bash
npm run dev
```

#### Backend Only
```bash
npm run dev:backend
```

#### Frontend Only
```bash
npm run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health
- **Admin Panel**: http://localhost:3000/admin (login with admin/admin123)

## Production Deployment

### 1. Environment Setup
- Copy `.env.production` and update with production values
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure domain settings

### 2. Build and Start
```bash
npm run build
npm start
```

### 3. Domain Configuration
- Update `PRODUCTION_DOMAIN=adityahospitalnagaon.com` in `.env.production`
- Configure SSL certificates
- Set up reverse proxy (nginx recommended)

## API Endpoints

### Public Endpoints
- `GET /api/health` - API health check
- `GET /api/departments` - List departments
- `GET /api/doctors` - List doctors
- `GET /api/services` - List services
- `POST /api/appointments` - Create appointment

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

## Default Admin Login
- **Username**: admin
- **Password**: admin123
- **Email**: admin@adityahospitalnagaon.com

**⚠️ Remember to change the default admin password after first login!**

## Troubleshooting

### MongoDB Connection Issues
1. Check if MongoDB service is running
2. Verify connection string format
3. Ensure network access (for Atlas)
4. Check firewall settings

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill the process
taskkill /PID <process_id> /F
```

### Environment Variables Not Loading
- Ensure `.env` file is in the root directory
- Check file encoding (should be UTF-8)
- Restart the application after changes

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, Vite, Tailwind CSS
- **Authentication**: JWT
- **Deployment**: PM2, Nginx (production)

For more help, check the API documentation or contact the development team.