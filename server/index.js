import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import departmentRoutes from './routes/departments.js';
import doctorRoutes from './routes/doctors.js';
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointments.js';
import dashboardRoutes from './routes/dashboard.js';

// ES Module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET environment variable not set, using default (NOT SECURE FOR PRODUCTION)');
}

const app = express();
const PORT = process.env.PORT || 4173;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
const dbConnected = await connectDB();

// Add database status to the app for routes to use
app.locals.dbConnected = dbConnected;

// Middleware
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['https://adityahospitalnagaon.com', 'https://www.adityahospitalnagaon.com'])
    : [process.env.FRONTEND_URL || 'http://adityahospitalnagaon.com', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes - place before static files to avoid conflicts
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Aditya Hospital API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    database: app.locals.dbConnected ? 'Connected' : 'Offline'
  });
});

// Static files serving (for production) - only after API routes
if (NODE_ENV === 'production') {
  // Log the paths for debugging
  const staticPath = path.join(__dirname, '../dist/public');
  const indexPath = path.join(__dirname, '../dist/public/index.html');
  
  console.log('.Static files directory:', staticPath);
  console.log('Index file path:', indexPath);
  
  // Check if static directory exists
  fs.access(staticPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Static files directory not accessible:', err);
    } else {
      console.log('Static files directory is accessible');
    }
  });
  
  // Check if index file exists
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Index file not accessible:', err);
    } else {
      console.log('Index file is accessible');
    }
  });
  
  // Serve static files from the React app build directory
  app.use(express.static(staticPath));
  
  // Catch-all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    // If it's an API request, don't serve the React app
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    
    console.log('Serving static file for path:', req.path);
    
    // Check if the file exists before trying to send it
    fs.access(indexPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Index file not found at: ${indexPath}`, err);
        return res.status(404).json({ 
          message: 'Frontend build not found. Please run npm run build.',
          path: indexPath,
          error: err.message
        });
      }
      console.log('Sending index.html file');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).json({ 
            message: 'Error serving frontend application',
            error: err.message
          });
        }
      });
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📊 API Health: http://${HOST}:${PORT}/api/health`);
  if (NODE_ENV === 'development') {
    console.log(`🖥️  Frontend: ${process.env.FRONTEND_URL || 'http://adityahospitalnagaon.com'}`);
  }
});

export default app;