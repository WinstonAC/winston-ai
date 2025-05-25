import { exit } from 'process';

async function main(): Promise<void> {
  try {
    // Create test user
    const user = await prisma.user.upsert({
      where: {
        email: 'test@example.com',
      },
      update: {},
      create: {
        id: 'clt9abxg90001wqlb9k9z7rbk',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date(),
        image: 'https://avatars.githubusercontent.com/u/1?v=4',
        role: 'USER',
      },
    });

    // Create test segment
    const segment = await prisma.segment.upsert({
      where: {
        id: 'clt9segment00001',
      },
      update: {},
      create: {
        id: 'clt9segment00001',
        name: 'Test Segment',
        description: 'A test segment for the sandbox environment',
        filters: {},
        createdBy: user.id,
      },
    });

    // Create test template
    const template = await prisma.template.upsert({
      where: {
        id: 'clt9template00001',
      },
      update: {},
      create: {
        id: 'clt9template00001',
        name: 'Test Template',
        subject: 'Test Email Subject',
        body: 'Hello, this is a test email content.',
        isPublic: false,
        createdBy: user.id,
      },
    });

    console.log('✅ Seeded user, segment, and template! Winston AI sandbox ready.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e: Error) => {
    console.error(e);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 