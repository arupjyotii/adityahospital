# Aditya Hospital Management System

A modern hospital management system built with React (frontend) and Express.js + MongoDB (backend).

## 🏗️ Project Structure

```
adityahospital/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin panel components
│   │   │   ├── website/    # Public website components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── server/                 # Express.js backend
│   ├── models/             # MongoDB models
│   │   ├── User.ts         # User authentication
│   │   ├── Department.ts   # Hospital departments
│   │   ├── Doctor.ts       # Doctor profiles
│   │   └── Service.ts      # Hospital services
│   ├── database.ts         # MongoDB connection
│   ├── index.ts            # Main server file
│   └── static-serve.ts     # Static file serving
└── .env                    # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Update `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/adityahospital
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
```

### 3. Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend    # Frontend only (port 5173)
npm run dev:backend     # Backend only (port 3001)
```

### 4. Build for Production
```bash
npm run build
npm start
```

## 🔑 Default Admin Login
- **Username**: `joonborah`
- **Password**: `r4nd0mP@ssw0rd123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/verify`
- `POST /api/auth/logout`

### Admin APIs (require authentication)
- `GET|POST|PUT|DELETE /api/departments`
- `GET|POST|PUT|DELETE /api/doctors` 
- `GET|POST|PUT|DELETE /api/services`
- `GET /api/dashboard`

### Public APIs
- `GET /api/public/departments`
- `GET /api/public/doctors`
- `GET /api/public/services`

### System
- `GET /health` - Health check

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **React Router** - Navigation

### Backend  
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **TypeScript** - Type safety

## 📱 Features

### Admin Panel
- User authentication
- Department management
- Doctor profiles
- Service management
- Dashboard with statistics

### Public Website
- Department listings
- Doctor profiles
- Service information
- Contact information
- About page

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Mongoose
- CORS protection
- Security headers

## 📝 Notes
- Frontend runs on port 5173 (development)
- Backend runs on port 3001
- MongoDB connection required
- Environment variables must be configured