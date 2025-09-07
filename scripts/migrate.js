import { db } from '../server/database.js';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIRECTORY || './data';

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Create tables if they don't exist
    await createTables();
    
    // Insert default data
    await insertDefaultData();
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function createTables() {
  console.log('📋 Creating database tables...');

  // Create departments table
  await db.schema
    .createTable('departments')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'varchar(255)', (col) => col.notNull())
    .addColumn('updated_at', 'varchar(255)', (col) => col.notNull())
    .execute();

  // Create doctors table
  await db.schema
    .createTable('doctors')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)')
    .addColumn('phone', 'varchar(50)')
    .addColumn('specialization', 'varchar(255)')
    .addColumn('department_id', 'integer')
    .addColumn('photo_url', 'varchar(500)')
    .addColumn('schedule', 'text')
    .addColumn('created_at', 'varchar(255)', (col) => col.notNull())
    .addColumn('updated_at', 'varchar(255)', (col) => col.notNull())
    .execute();

  // Create services table
  await db.schema
    .createTable('services')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('department_id', 'integer')
    .addColumn('created_at', 'varchar(255)', (col) => col.notNull())
    .addColumn('updated_at', 'varchar(255)', (col) => col.notNull())
    .execute();

  console.log('✅ Database tables created successfully!');
}

async function insertDefaultData() {
  console.log('📝 Inserting default data...');

  // Check if departments already exist
  const existingDepartments = await db.selectFrom('departments').select('id').execute();
  
  if (existingDepartments.length === 0) {
    // Insert default departments
    const defaultDepartments = [
      {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system care',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Pediatrics',
        description: 'Medical care for infants, children, and adolescents',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Orthopedics',
        description: 'Bone, joint, and muscle care',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Emergency Medicine',
        description: 'Emergency and urgent care services',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const dept of defaultDepartments) {
      await db.insertInto('departments').values(dept).execute();
    }
    
    console.log('✅ Default departments inserted!');
  }

  // Check if doctors already exist
  const existingDoctors = await db.selectFrom('doctors').select('id').execute();
  
  if (existingDoctors.length === 0) {
    // Get the first department for sample doctor
    const firstDept = await db.selectFrom('departments').select('id').limit(1).executeTakeFirst();
    
    // Insert sample doctor
    const sampleDoctor = {
      name: 'Dr. Sample Doctor',
      email: 'doctor@adityahospitalnagaon.com',
      phone: '+91-9876543210',
      specialization: 'General Medicine',
      department_id: firstDept?.id || null,
      photo_url: null,
      schedule: 'Mon-Fri 9AM-5PM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insertInto('doctors').values(sampleDoctor).execute();
    
    console.log('✅ Sample doctor inserted!');
  }

  // Check if services already exist
  const existingServices = await db.selectFrom('services').select('id').execute();
  
  if (existingServices.length === 0) {
    // Get departments for service assignment
    const departments = await db.selectFrom('departments').select('id').execute();
    
    // Insert default services
    const defaultServices = [
      {
        name: 'General Consultation',
        description: 'General medical consultation and checkup',
        department_id: departments[0]?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Emergency Care',
        description: '24/7 emergency medical care',
        department_id: departments.find(d => d.id === departments[3]?.id)?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const service of defaultServices) {
      await db.insertInto('services').values(service).execute();
    }
    
    console.log('✅ Default services inserted!');
  }

  console.log('✅ Default data insertion completed!');
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('🎉 Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

export { runMigrations };

