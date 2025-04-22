import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { EmailTemplate, defaultTemplates } from '../lib/templates';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Constants for sample data generation
const SAMPLE_LEADS_PER_USER = 15;
const COMPANY_DOMAINS = ['acme.com', 'techcorp.com', 'innovate.io', 'startup.co', 'enterprise.com'];
const LEAD_STATUSES = ['Pending', 'Sent', 'Opened', 'Clicked', 'Booked', 'Bounced'] as const;
const CLASSIFICATIONS = ['Interested', 'Not Interested', 'Needs Info', null] as const;

// Helper functions for data generation
const generateCompanyEmail = (name: string, domain: string) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanName}@${domain}`;
};

const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

async function createTeam(name: string) {
  return prisma.team.create({
    data: {
      name,
      settings: {
        create: {
          maxUsers: 10,
          plan: 'FREE',
        },
      },
    },
  });
}

async function createSampleUser(
  prisma: PrismaClient,
  email: string,
  password: string,
  role: 'ADMIN' | 'USER' = 'USER'
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      settings: {
        create: {
          emailTemplate: defaultTemplates[0] as EmailTemplate,
        },
      },
    },
  });

  return user;
}

async function createSampleLeads(userId: string, count: number) {
  const leads = [];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

  for (let i = 0; i < count; i++) {
    const companyDomain = getRandomElement(COMPANY_DOMAINS);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const companyName = faker.company.name();
    const status = getRandomElement(LEAD_STATUSES);
    const classification = getRandomElement(CLASSIFICATIONS);

    leads.push({
      name: `${firstName} ${lastName}`,
      email: generateCompanyEmail(`${firstName}.${lastName}`, companyDomain),
      company: companyName,
      status,
      classification,
      userId,
      sentAt: status !== 'Pending' ? getRandomDate(startDate, new Date()) : null,
      createdAt: getRandomDate(startDate, new Date()),
      notes: faker.lorem.paragraph(),
      phone: faker.phone.number(),
      position: faker.person.jobTitle(),
      emailHistory: status !== 'Pending' ? {
        create: {
          subject: faker.lorem.sentence(),
          body: faker.lorem.paragraphs(2),
          sentAt: getRandomDate(startDate, new Date()),
          templateId: defaultTemplates[Math.floor(Math.random() * defaultTemplates.length)].id,
        },
      } : undefined,
    });
  }

  return prisma.lead.createMany({ data: leads });
}

async function main() {
  console.log('🚀 Setting up sandbox environment...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.emailHistory.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.teamInvite.deleteMany();
    await prisma.teamSettings.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Create demo team
    console.log('👥 Creating demo team...');
    const demoTeam = await createTeam('Demo Team');

    // Create demo users
    console.log('👥 Creating demo users...');
    const adminUser = await createSampleUser(prisma, 'admin@winston-ai.com', 'demo123', 'ADMIN');
    const demoUser = await createSampleUser(prisma, 'demo@winston-ai.com', 'demo123', 'USER');
    const testUser = await createSampleUser(prisma, 'test@winston-ai.com', 'demo123', 'USER');

    // Create sample leads for each user
    console.log('📊 Creating sample leads...');
    await createSampleLeads(adminUser.id, SAMPLE_LEADS_PER_USER);
    await createSampleLeads(demoUser.id, SAMPLE_LEADS_PER_USER);
    await createSampleLeads(testUser.id, SAMPLE_LEADS_PER_USER);

    console.log('\n✅ Sandbox setup complete!');
    console.log('\n📝 Login Credentials:');
    console.log('------------------------');
    console.log('Admin User:');
    console.log('Email: admin@winston-ai.com');
    console.log('Password: demo123');
    console.log('Role: Team Admin');
    console.log('\nDemo User:');
    console.log('Email: demo@winston-ai.com');
    console.log('Password: demo123');
    console.log('Role: Team Member');
    console.log('\nTest User:');
    console.log('Email: test@winston-ai.com');
    console.log('Password: demo123');
    console.log('Role: Team Member');
    console.log('------------------------');
    
    // Print some statistics
    const totalLeads = await prisma.lead.count();
    const totalUsers = await prisma.user.count();
    const totalEmails = await prisma.emailHistory.count();
    const totalTeams = await prisma.team.count();
    console.log('\n📊 Sandbox Statistics:');
    console.log(`Total Teams: ${totalTeams}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Leads: ${totalLeads}`);
    console.log(`Total Emails: ${totalEmails}`);
    console.log('\n🌟 You can now start testing the application!');

  } catch (error) {
    console.error('❌ Error setting up sandbox:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 