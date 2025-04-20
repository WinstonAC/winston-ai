import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test team
  const team = await prisma.team.create({
    data: {
      name: 'Demo Team',
      settings: {
        create: {
          maxUsers: 10,
          plan: 'PRO'
        }
      }
    }
  });

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@winston-ai.com',
        password: await hash('demo123', 10),
        role: 'ADMIN',
        team: {
          connect: { id: team.id }
        },
        teamRole: 'OWNER',
        userSettings: {
          create: {
            emailSignature: 'Best regards,\nAdmin User'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@winston-ai.com',
        password: await hash('demo123', 10),
        role: 'USER',
        team: {
          connect: { id: team.id }
        },
        teamRole: 'MEMBER',
        userSettings: {
          create: {
            emailSignature: 'Best regards,\nDemo User'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@winston-ai.com',
        password: await hash('demo123', 10),
        role: 'USER',
        team: {
          connect: { id: team.id }
        },
        teamRole: 'MEMBER',
        userSettings: {
          create: {
            emailSignature: 'Best regards,\nTest User'
          }
        }
      }
    })
  ]);

  // Create sample leads
  const leads = await Promise.all([
    ...Array(10).fill(null).map((_, i) => 
      prisma.lead.create({
        data: {
          name: `Lead ${i + 1}`,
          email: `lead${i + 1}@example.com`,
          status: ['Sent', 'Opened', 'Clicked', 'Replied'][Math.floor(Math.random() * 4)],
          classification: ['Hot', 'Warm', 'Cold'][Math.floor(Math.random() * 3)],
          team: {
            connect: { id: team.id }
          },
          user: {
            connect: { id: users[0].id }
          },
          activities: {
            create: {
              type: 'lead_created',
              team: {
                connect: { id: team.id }
              }
            }
          }
        }
      })
    )
  ]);

  // Create email templates
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: 'Welcome Email',
        subject: 'Welcome to Our Service',
        body: 'Dear {{name}},\n\nThank you for your interest in our service...',
        isPublic: true,
        createdBy: users[0].id,
        assets: {
          create: {
            type: 'image',
            url: 'https://example.com/welcome.jpg',
            name: 'Welcome Image',
            size: 1024,
            mimeType: 'image/jpeg'
          }
        }
      }
    }),
    prisma.template.create({
      data: {
        name: 'Follow-up Email',
        subject: 'Following Up on Our Conversation',
        body: 'Hi {{name}},\n\nI hope this email finds you well...',
        isPublic: true,
        createdBy: users[0].id
      }
    })
  ]);

  // Share templates with team
  await Promise.all([
    ...templates.map(template =>
      prisma.templateShare.create({
        data: {
          templateId: template.id,
          userId: users[1].id,
          permission: 'view'
        }
      })
    )
  ]);

  // Create sample email history
  await Promise.all([
    ...leads.map(lead =>
      prisma.emailHistory.create({
        data: {
          leadId: lead.id,
          subject: 'Welcome Email',
          body: 'Dear {{name}},\n\nThank you for your interest...',
          templateId: templates[0].id,
          sentAt: new Date(),
          openedAt: Math.random() > 0.5 ? new Date() : null,
          clickedAt: Math.random() > 0.7 ? new Date() : null,
          bounced: false
        }
      })
    )
  ]);

  console.log('Sandbox data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 