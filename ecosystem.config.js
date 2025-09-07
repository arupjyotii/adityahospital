module.exports = {
  apps: [{
    name: 'aditya-hospital-admin',
    script: 'dist/server/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      DOMAIN: 'adityahospitalnagaon.com'
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto restart
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data', 'uploads'],
    max_memory_restart: '1G',
    
    // Advanced PM2 features
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Process management
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Environment variables
    env_file: 'env.production'
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: ['adityahospitalnagaon.com'],
      ref: 'origin/main',
      path: '/var/www/aditya-hospital-admin',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

