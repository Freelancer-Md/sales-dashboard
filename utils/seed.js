import SuperAdmin from '../models/SuperAdmin.js';
import Admin from '../models/Admin.js';
import TeamLead from '../models/TeamLead.js';
import Salesperson from '../models/Salesperson.js';
import Sales from '../models/Sales.js';

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const superAdminCount = await SuperAdmin.countDocuments();
    if (superAdminCount > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    // Create Super Admins
    const superAdmins = await SuperAdmin.create([
      {
        name: 'Super Admin 1',
        email: 'superadmin1@example.com',
        password: 'password123',
        phone: '1234567890'
      },
      {
        name: 'Super Admin 2',
        email: 'superadmin2@example.com',
        password: 'password123',
        phone: '1234567891'
      }
    ]);

    // Create Admins
    const admins = await Admin.create([
      {
        name: 'Admin 1',
        email: 'admin1@example.com',
        password: 'password123',
        phone: '2234567890'
      },
      {
        name: 'Admin 2',
        email: 'admin2@example.com',
        password: 'password123',
        phone: '2234567891'
      }
    ]);

    // Create Team Leads
    const teamLeads = await TeamLead.create([
      {
        name: 'Team Lead 1',
        email: 'tl1@example.com',
        password: 'password123',
        phone: '3234567890'
      },
      {
        name: 'Team Lead 2',
        email: 'tl2@example.com',
        password: 'password123',
        phone: '3234567891'
      },
      {
        name: 'Team Lead 3',
        email: 'tl3@example.com',
        password: 'password123',
        phone: '3234567892'
      }
    ]);

    // Create Salespersons
    const salespersons = await Salesperson.create([
      {
        name: 'Salesperson 1',
        phone: '4234567890',
        team_lead_id: teamLeads[0]._id
      },
      {
        name: 'Salesperson 2',
        phone: '4234567891',
        team_lead_id: teamLeads[0]._id
      },
      {
        name: 'Salesperson 3',
        phone: '4234567892',
        team_lead_id: teamLeads[1]._id
      },
      {
        name: 'Salesperson 4',
        phone: '4234567893',
        team_lead_id: teamLeads[1]._id
      },
      {
        name: 'Salesperson 5',
        phone: '4234567894',
        team_lead_id: teamLeads[2]._id
      }
    ]);

    // Create sample sales
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    await Sales.create([
      {
        policy_number: 'POL001',
        vehicle_number: 'VEH001',
        salesperson_id: salespersons[0]._id,
        team_lead_id: teamLeads[0]._id,
        date: today,
        status: 'approved',
        created_by: teamLeads[0]._id,
        logs: [{
          action: 'created',
          by: 'tl',
          user_id: teamLeads[0]._id,
          timestamp: new Date()
        }]
      },
      {
        policy_number: 'POL002',
        vehicle_number: 'VEH002',
        salesperson_id: salespersons[1]._id,
        team_lead_id: teamLeads[0]._id,
        date: yesterday,
        status: 'pending',
        created_by: teamLeads[0]._id,
        logs: [{
          action: 'created',
          by: 'tl',
          user_id: teamLeads[0]._id,
          timestamp: new Date()
        }]
      },
      {
        policy_number: 'POL003',
        vehicle_number: 'VEH003',
        salesperson_id: salespersons[2]._id,
        team_lead_id: teamLeads[1]._id,
        date: lastWeek,
        status: 'approved',
        created_by: teamLeads[1]._id,
        logs: [{
          action: 'created',
          by: 'tl',
          user_id: teamLeads[1]._id,
          timestamp: new Date()
        }]
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('Super Admin: superadmin1@example.com / password123');
    console.log('Admin: admin1@example.com / password123');
    console.log('Team Lead: tl1@example.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  }
};