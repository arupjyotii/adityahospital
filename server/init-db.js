import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';
import Service from './models/Service.js';

// Load environment variables
dotenv.config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://codemicofficial_db_user:Vhv7Tjr0uIVg3wuA@cluster0.my5lehs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Create default admin user
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@adityahospitalnagaon.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+91-9876543210'
        }
      });
      await adminUser.save();
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@adityahospitalnagaon.com');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample departments
    const departmentData = [
      {
        name: 'Cardiology',
        description: 'Comprehensive heart care and cardiovascular treatments',
        features: ['ECG', 'Echocardiography', 'Cardiac Catheterization', '24-hour Monitoring'],
        services: ['Heart Surgery', 'Angioplasty', 'Pacemaker Implantation'],
        emergencyAvailable: true,
        order: 1
      },
      {
        name: 'Orthopedics',
        description: 'Bone, joint, and musculoskeletal system treatments',
        features: ['Joint Replacement', 'Fracture Treatment', 'Sports Medicine'],
        services: ['Knee Replacement', 'Hip Surgery', 'Arthroscopy'],
        order: 2
      },
      {
        name: 'General Medicine',
        description: 'Primary healthcare and general medical consultations',
        features: ['Health Checkups', 'Chronic Disease Management', 'Preventive Care'],
        services: ['General Consultation', 'Health Screening', 'Vaccination'],
        emergencyAvailable: true,
        order: 3
      },
      {
        name: 'Pediatrics',
        description: 'Specialized healthcare for children and adolescents',
        features: ['Child Development Monitoring', 'Immunization', 'Growth Assessment'],
        services: ['Child Consultation', 'Vaccination', 'Development Screening'],
        order: 4
      }
    ];

    for (const deptData of departmentData) {
      const existingDept = await Department.findOne({ name: deptData.name });
      if (!existingDept) {
        const department = new Department(deptData);
        await department.save();
        console.log(`✅ Created department: ${deptData.name}`);
      }
    }

    // Create sample doctors
    const departments = await Department.find();
    const doctorData = [
      {
        name: 'Dr. Rajesh Kumar',
        specialization: 'Cardiologist',
        department: departments.find(d => d.name === 'Cardiology')?._id,
        qualification: 'MBBS, MD (Cardiology), DM (Cardiology)',
        experience: 15,
        bio: 'Experienced cardiologist with expertise in interventional cardiology and heart surgeries.',
        expertise: ['Angioplasty', 'Heart Surgery', 'Cardiac Catheterization'],
        consultationFee: 1500,
        languages: ['English', 'Hindi', 'Assamese'],
        order: 1
      },
      {
        name: 'Dr. Priya Sharma',
        specialization: 'Orthopedic Surgeon',
        department: departments.find(d => d.name === 'Orthopedics')?._id,
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 12,
        bio: 'Specialized in joint replacement surgeries and sports medicine.',
        expertise: ['Joint Replacement', 'Arthroscopy', 'Fracture Treatment'],
        consultationFee: 1200,
        languages: ['English', 'Hindi'],
        order: 2
      },
      {
        name: 'Dr. Amit Das',
        specialization: 'General Physician',
        department: departments.find(d => d.name === 'General Medicine')?._id,
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: 10,
        bio: 'Experienced general physician providing comprehensive primary healthcare.',
        expertise: ['General Medicine', 'Diabetes Management', 'Hypertension'],
        consultationFee: 800,
        languages: ['English', 'Hindi', 'Assamese'],
        order: 3
      },
      {
        name: 'Dr. Sunita Devi',
        specialization: 'Pediatrician',
        department: departments.find(d => d.name === 'Pediatrics')?._id,
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 8,
        bio: 'Caring pediatrician dedicated to child health and development.',
        expertise: ['Child Care', 'Vaccination', 'Growth Assessment'],
        consultationFee: 1000,
        languages: ['English', 'Hindi', 'Assamese'],
        order: 4
      }
    ];

    for (const docData of doctorData) {
      if (docData.department) {
        const existingDoc = await Doctor.findOne({ name: docData.name });
        if (!existingDoc) {
          const doctor = new Doctor(docData);
          await doctor.save();
          console.log(`✅ Created doctor: ${docData.name}`);
        }
      }
    }

    // Create sample services
    const serviceData = [
      {
        name: 'Cardiac Consultation',
        category: 'diagnostic',
        description: 'Comprehensive heart examination and consultation',
        shortDescription: 'Expert cardiac evaluation and treatment planning',
        department: departments.find(d => d.name === 'Cardiology')?._id,
        pricing: { basePrice: 1500, currency: 'INR' },
        order: 1
      },
      {
        name: 'Joint Replacement Surgery',
        category: 'surgical',
        description: 'Advanced joint replacement procedures for hip and knee',
        shortDescription: 'Modern joint replacement with quick recovery',
        department: departments.find(d => d.name === 'Orthopedics')?._id,
        pricing: { basePrice: 250000, currency: 'INR' },
        order: 2
      },
      {
        name: 'Health Checkup Package',
        category: 'preventive',
        description: 'Comprehensive health screening and preventive care',
        shortDescription: 'Complete health assessment package',
        department: departments.find(d => d.name === 'General Medicine')?._id,
        pricing: { basePrice: 3000, currency: 'INR' },
        order: 3
      },
      {
        name: 'Child Vaccination',
        category: 'preventive',
        description: 'Complete immunization schedule for children',
        shortDescription: 'Safe and effective child vaccination program',
        department: departments.find(d => d.name === 'Pediatrics')?._id,
        pricing: { basePrice: 500, currency: 'INR' },
        order: 4
      }
    ];

    for (const serviceItem of serviceData) {
      if (serviceItem.department) {
        const existingService = await Service.findOne({ name: serviceItem.name });
        if (!existingService) {
          const service = new Service(serviceItem);
          await service.save();
          console.log(`✅ Created service: ${serviceItem.name}`);
        }
      }
    }

    console.log('\\n🎉 Database initialization completed successfully!');
    console.log('\\n📋 Summary:');
    console.log(`   Departments: ${await Department.countDocuments()}`);
    console.log(`   Doctors: ${await Doctor.countDocuments()}`);
    console.log(`   Services: ${await Service.countDocuments()}`);
    console.log(`   Users: ${await User.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run initialization
initDatabase();