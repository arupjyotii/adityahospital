# Aditya Hospital Management System

A modern hospital management system built with React (Vite) frontend and Express.js backend with MongoDB database.

## 🏥 Features

- Patient appointment scheduling
- Department and doctor management
- Service listings
- User authentication and authorization
- Responsive design for all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Deployment**: PM2, Nginx

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd adityahospital
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   
   # Create .env file in client directory
   cp client/.env.example client/.env
   ```

4. Configure your MongoDB database in the `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/aditya_hospital
   ```

### Development

To run the development server:

```bash
# Run both frontend and backend
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend
```

### Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. For production deployment with PM2:
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start application with PM2
   pm2 start ecosystem.config.js --env production
   
   # Save PM2 configuration
   pm2 save
   ```

## 📁 Project Structure

```
adityahospital/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utility functions and config
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main application component
│   └── index.html       # HTML template
├── server/              # Express backend
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models (Mongoose)
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Server entry point
├── dist/                # Built files (generated)
├── logs/                # Log files
└── uploads/             # Uploaded files
```

## 🌐 Environment Variables

### Backend (.env)

```env
# Environment Configuration
NODE_ENV=development|production
PORT=4173
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aditya_hospital

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=http://adityahospitalnagaon.com,https://yourdomain.com

# Frontend URL
FRONTEND_URL=http://adityahospitalnagaon.com
```

### Frontend (client/.env)

```env
VITE_API_URL=http://adityahospitalnagaon.com/api
```

## 🐳 Deployment

### VPS Deployment

1. Upload the project files to your VPS:
   ```bash
   # Using the deployment script (Linux/Mac)
   chmod +x deploy-vps.sh
   ./deploy-vps.sh
   
   # Using the deployment script (Windows)
   .\deploy-vps.ps1
   ```

2. Start the application with PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

### Nginx Configuration

Create an Nginx configuration file at `/etc/nginx/sites-available/adityahospital`:

```nginx
server {
    listen 80;
    server_name adityahospitalnagaon.com www.adityahospitalnagaon.com;

    # Frontend
    location / {
        root /domains/adityahospitalnagaon.com/public_html/dist/public;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://adityahospitalnagaon.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Logging
    access_log /var/log/nginx/adityahospital.access.log;
    error_log /var/log/nginx/adityahospital.error.log;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/adityahospital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot find module 'path-to-regexp'" Error**:
   This usually occurs due to dependency conflicts. Run the fix script to resolve:
   ```bash
   # Linux/Mac
   ./fix-mongodb-deps.sh
   
   # Windows
   .\fix-mongodb-deps.ps1
   ```

2. **Database Connection Issues**:
   - Ensure MongoDB is running
   - Verify database URI in `.env` file
   - Check if the database exists and user has proper permissions

3. **PM2 Not Starting**:
   - Check logs: `pm2 logs aditya-hospital`
   - Restart: `pm2 restart aditya-hospital`
   - Delete and restart: `pm2 delete aditya-hospital && pm2 start ecosystem.config.js`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email adityahospitalnagaon@gmail.com or open an issue on the repository.