import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dashboard API
app.get('/api/dashboard', async (req, res) => {
  try {
    const doctorsCount = await db.selectFrom('doctors').select(db.fn.count('id').as('count')).executeTakeFirst();
    const departmentsCount = await db.selectFrom('departments').select(db.fn.count('id').as('count')).executeTakeFirst();
    const servicesCount = await db.selectFrom('services').select(db.fn.count('id').as('count')).executeTakeFirst();

    res.json({
      doctors: Number(doctorsCount?.count) || 0,
      departments: Number(departmentsCount?.count) || 0,
      services: Number(servicesCount?.count) || 0
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Department APIs
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await db.selectFrom('departments')
      .selectAll()
      .orderBy('name')
      .execute();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.insertInto('departments')
      .values({
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning('id')
      .executeTakeFirst();
    
    res.json({ id: result?.id, name, description });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    await db.updateTable('departments')
      .set({
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', Number(id))
      .execute();
    
    res.json({ id: Number(id), name, description });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteFrom('departments').where('id', '=', Number(id)).execute();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// Doctor APIs
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await db.selectFrom('doctors')
      .leftJoin('departments', 'doctors.department_id', 'departments.id')
      .select([
        'doctors.id',
        'doctors.name',
        'doctors.email',
        'doctors.phone',
        'doctors.specialization',
        'doctors.department_id',
        'doctors.photo_url',
        'doctors.schedule',
        'doctors.created_at',
        'doctors.updated_at',
        'departments.name as department_name'
      ])
      .orderBy('doctors.name')
      .execute();
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const { name, email, phone, specialization, department_id, photo_url, schedule } = req.body;
    const result = await db.insertInto('doctors')
      .values({
        name,
        email,
        phone,
        specialization,
        department_id: department_id || null,
        photo_url,
        schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning('id')
      .executeTakeFirst();
    
    res.json({ id: result?.id, name, email, phone, specialization, department_id, photo_url, schedule });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, department_id, photo_url, schedule } = req.body;
    
    await db.updateTable('doctors')
      .set({
        name,
        email,
        phone,
        specialization,
        department_id: department_id || null,
        photo_url,
        schedule,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', Number(id))
      .execute();
    
    res.json({ id: Number(id), name, email, phone, specialization, department_id, photo_url, schedule });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteFrom('doctors').where('id', '=', Number(id)).execute();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// Service APIs
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.selectFrom('services')
      .leftJoin('departments', 'services.department_id', 'departments.id')
      .select([
        'services.id',
        'services.name',
        'services.description',
        'services.department_id',
        'services.created_at',
        'services.updated_at',
        'departments.name as department_name'
      ])
      .orderBy('services.name')
      .execute();
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, description, department_id } = req.body;
    const result = await db.insertInto('services')
      .values({
        name,
        description,
        department_id: department_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning('id')
      .executeTakeFirst();
    
    res.json({ id: result?.id, name, description, department_id });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, department_id } = req.body;
    
    await db.updateTable('services')
      .set({
        name,
        description,
        department_id: department_id || null,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', Number(id))
      .execute();
    
    res.json({ id: Number(id), name, description, department_id });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteFrom('services').where('id', '=', Number(id)).execute();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
