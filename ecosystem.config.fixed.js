export default {
  apps: [
    {
      name: 'adityahospital',
      script: './server/index.js',
      cwd: '/root/adityahospital',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 4173,
        HOST: 'localhost'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4173,
        HOST: '0.0.0.0'
      },
      // PM2 Configuration
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Cluster Configuration
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Auto-restart Configuration
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Advanced Configuration
      node_args: '--max-old-space-size=1024',
      
      // Process Management
      autorestart: true,
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.git'
      ],
      
      // Environment file
      env_file: '.env'
    }
  ]
};