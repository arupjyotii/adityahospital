// Mock data for testing without MongoDB connection

export const mockDepartments = [
  {
    _id: '60f3b4b3b3f1b3001f8b4567',
    name: 'Cardiology',
    slug: 'cardiology',
    description: 'Comprehensive heart care and cardiovascular treatments with state-of-the-art equipment',
    image: '/images/departments/cardiology.jpg',
    features: ['ECG', 'Echocardiography', 'Cardiac Catheterization', '24-hour Monitoring'],
    services: ['Heart Surgery', 'Angioplasty', 'Pacemaker Implantation'],
    isActive: true,
    order: 1,
    emergencyAvailable: true,
    contactInfo: {
      phone: '+91-98765-43210',
      email: 'cardiology@adityahospitalnagaon.com'
    }
  },
  {
    _id: '60f3b4b3b3f1b3001f8b4568',
    name: 'Orthopedics',
    slug: 'orthopedics',
    description: 'Bone, joint, and musculoskeletal system treatments with modern surgical techniques',
    image: '/images/departments/orthopedics.jpg',
    features: ['Joint Replacement', 'Fracture Treatment', 'Sports Medicine', 'Arthroscopy'],
    services: ['Knee Replacement', 'Hip Surgery', 'Bone Setting'],
    isActive: true,
    order: 2,
    emergencyAvailable: false,
    contactInfo: {
      phone: '+91-98765-43211',
      email: 'orthopedics@adityahospitalnagaon.com'
    }
  },
  {
    _id: '60f3b4b3b3f1b3001f8b4569',
    name: 'General Medicine',
    slug: 'general-medicine',
    description: 'Primary healthcare and general medical consultations for all age groups',
    image: '/images/departments/general-medicine.jpg',
    features: ['Health Checkups', 'Chronic Disease Management', 'Preventive Care'],
    services: ['General Consultation', 'Health Screening', 'Vaccination'],
    isActive: true,
    order: 3,
    emergencyAvailable: true,
    contactInfo: {
      phone: '+91-98765-43212',
      email: 'general@adityahospitalnagaon.com'
    }
  },
  {
    _id: '60f3b4b3b3f1b3001f8b456a',
    name: 'Pediatrics',
    slug: 'pediatrics',
    description: 'Specialized healthcare for children and adolescents with gentle care',
    image: '/images/departments/pediatrics.jpg',
    features: ['Child Development Monitoring', 'Immunization', 'Growth Assessment'],
    services: ['Child Consultation', 'Vaccination', 'Development Screening'],
    isActive: true,
    order: 4,
    emergencyAvailable: false,
    contactInfo: {
      phone: '+91-98765-43213',
      email: 'pediatrics@adityahospitalnagaon.com'
    }
  }
];

export const mockDoctors = [
  {
    _id: '60f3b4b3b3f1b3001f8b456b',
    name: 'Dr. Rajesh Kumar',
    slug: 'dr-rajesh-kumar',
    specialization: 'Interventional Cardiologist',
    department: '60f3b4b3b3f1b3001f8b4567',
    qualification: 'MBBS, MD (Cardiology), DM (Interventional Cardiology)',
    experience: 15,
    image: '/images/doctors/dr-rajesh-kumar.jpg',
    bio: 'Dr. Rajesh Kumar is a renowned interventional cardiologist with over 15 years of experience in treating complex cardiac conditions. He specializes in minimally invasive cardiac procedures.',
    expertise: ['Angioplasty', 'Cardiac Catheterization', 'Pacemaker Implantation', 'Heart Surgery'],
    education: [
      { degree: 'MBBS', institution: 'AIIMS New Delhi', year: 2005 },
      { degree: 'MD Cardiology', institution: 'PGIMER Chandigarh', year: 2009 },
      { degree: 'DM Interventional Cardiology', institution: 'AIIMS New Delhi', year: 2012 }
    ],
    consultationFee: 1500,
    languages: ['English', 'Hindi', 'Assamese'],
    isActive: true,
    order: 1,
    rating: { average: 4.8, count: 156 },
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: true },
      sunday: { start: '', end: '', available: false }
    }
  },
  {
    _id: '60f3b4b3b3f1b3001f8b456c',
    name: 'Dr. Priya Sharma',
    slug: 'dr-priya-sharma',
    specialization: 'Orthopedic Surgeon',
    department: '60f3b4b3b3f1b3001f8b4568',
    qualification: 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement',
    experience: 12,
    image: '/images/doctors/dr-priya-sharma.jpg',
    bio: 'Dr. Priya Sharma is a skilled orthopedic surgeon specializing in joint replacement surgeries and sports medicine. She has successfully performed over 500 joint replacement procedures.',
    expertise: ['Joint Replacement', 'Arthroscopy', 'Sports Medicine', 'Fracture Treatment'],
    education: [
      { degree: 'MBBS', institution: 'Guwahati Medical College', year: 2008 },
      { degree: 'MS Orthopedics', institution: 'PGIMER Chandigarh', year: 2012 },
      { degree: 'Fellowship Joint Replacement', institution: 'Max Hospital Delhi', year: 2013 }
    ],
    consultationFee: 1200,
    languages: ['English', 'Hindi', 'Assamese'],
    isActive: true,
    order: 2,
    rating: { average: 4.7, count: 98 }
  },
  {
    _id: '60f3b4b3b3f1b3001f8b456d',
    name: 'Dr. Amit Das',
    slug: 'dr-amit-das',
    specialization: 'General Physician',
    department: '60f3b4b3b3f1b3001f8b4569',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: 10,
    image: '/images/doctors/dr-amit-das.jpg',
    bio: 'Dr. Amit Das is an experienced general physician providing comprehensive primary healthcare services. He has expertise in managing chronic diseases and preventive care.',
    expertise: ['General Medicine', 'Diabetes Management', 'Hypertension', 'Preventive Care'],
    consultationFee: 800,
    languages: ['English', 'Hindi', 'Assamese'],
    isActive: true,
    order: 3,
    rating: { average: 4.6, count: 234 }
  }
];

export const mockServices = [
  {
    _id: '60f3b4b3b3f1b3001f8b456e',
    name: 'Cardiac Consultation',
    slug: 'cardiac-consultation',
    category: 'diagnostic',
    description: 'Comprehensive cardiac evaluation including ECG, ECHO, and consultation with our expert cardiologists.',
    shortDescription: 'Expert cardiac evaluation and treatment planning',
    department: '60f3b4b3b3f1b3001f8b4567',
    relatedDoctors: ['60f3b4b3b3f1b3001f8b456b'],
    features: ['ECG', 'Echocardiography', 'Expert Consultation', 'Treatment Planning'],
    pricing: { basePrice: 1500, currency: 'INR' },
    isActive: true,
    order: 1
  },
  {
    _id: '60f3b4b3b3f1b3001f8b456f',
    name: 'Joint Replacement Surgery',
    slug: 'joint-replacement-surgery',
    category: 'surgical',
    description: 'Advanced joint replacement procedures for hip and knee with modern prosthetics and minimally invasive techniques.',
    shortDescription: 'Modern joint replacement with quick recovery',
    department: '60f3b4b3b3f1b3001f8b4568',
    relatedDoctors: ['60f3b4b3b3f1b3001f8b456c'],
    features: ['Minimally Invasive', 'Modern Prosthetics', 'Quick Recovery', 'Post-op Care'],
    pricing: { basePrice: 250000, currency: 'INR' },
    isActive: true,
    order: 2
  },
  {
    _id: '60f3b4b3b3f1b3001f8b4570',
    name: 'Health Checkup Package',
    slug: 'health-checkup-package',
    category: 'preventive',
    description: 'Comprehensive health screening package including blood tests, imaging, and consultation.',
    shortDescription: 'Complete health assessment package',
    department: '60f3b4b3b3f1b3001f8b4569',
    relatedDoctors: ['60f3b4b3b3f1b3001f8b456d'],
    features: ['Blood Tests', 'X-Ray', 'ECG', 'General Consultation'],
    pricing: { basePrice: 3000, currency: 'INR' },
    isActive: true,
    order: 3
  }
];

export const mockUser = {
  _id: '60f3b4b3b3f1b3001f8b4571',
  username: 'admin',
  email: 'admin@adityahospitalnagaon.com',
  role: 'admin',
  isActive: true,
  profile: {
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+91-9876543210'
  },
  comparePassword: async () => true
};