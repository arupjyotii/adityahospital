import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function buildProduction() {
  try {
    console.log('🚀 Starting production build...');

    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }

    // Install all dependencies (including dev dependencies for build)
    console.log('📦 Installing dependencies...');
    await execAsync('npm ci');

    // Build frontend
    console.log('🏗️  Building frontend...');
    await execAsync('npm run build');

    // Install only production dependencies after build
    console.log('📦 Installing production dependencies...');
    await execAsync('npm ci --only=production');

    // Create necessary directories
    console.log('📁 Creating directories...');
    const dirs = ['logs', 'data', 'uploads', 'backups'];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Set proper permissions
    console.log('🔐 Setting permissions...');
    await execAsync('chmod 755 logs data uploads backups');
    await execAsync('chmod 644 env.production');

    // Run database migrations
    console.log('🗄️  Running database migrations...');
    await execAsync('node scripts/migrate.js');

    console.log('✅ Production build completed successfully!');
    console.log('🎯 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildProduction();
}

