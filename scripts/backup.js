import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BACKUP_DIR = './backups';
const DATA_DIR = process.env.DATA_DIRECTORY || './data';
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');

async function createBackup() {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `database-backup-${timestamp}.sqlite`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    // Compress the backup
    const compressedFilename = `${backupFilename}.gz`;
    const compressedPath = path.join(BACKUP_DIR, compressedFilename);
    
    await execAsync(`gzip -c "${backupPath}" > "${compressedPath}"`);
    
    // Remove uncompressed backup
    fs.unlinkSync(backupPath);

    console.log(`✅ Backup created: ${compressedFilename}`);
    
    // Clean up old backups
    await cleanupOldBackups();
    
    return compressedPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

async function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > retentionMs) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBackup()
    .then(() => {
      console.log('🎉 Backup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Backup failed:', error);
      process.exit(1);
    });
}

export { createBackup, cleanupOldBackups };

