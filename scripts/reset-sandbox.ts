import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all data in reverse order of dependencies
  await prisma.chatbotInteraction.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.emailHistory.deleteMany();
  await prisma.templateShare.deleteMany();
  await prisma.templateAsset.deleteMany();
  await prisma.template.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.teamSettings.deleteMany();
  await prisma.team.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('Sandbox data reset successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 