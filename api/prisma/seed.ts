import { PrismaClient, UserRole, ApprovalStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Admin User
  const passwordHash = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@linguistic.com' },
    update: {},
    create: {
      email: 'admin@linguistic.com',
      name: 'System Admin',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // Create Operator User
  const operatorHash = await argon2.hash('operator123');
  await prisma.user.upsert({
    where: { email: 'operator@linguistic.com' },
    update: {},
    create: {
      email: 'operator@linguistic.com',
      name: 'Linguistic Operator',
      passwordHash: operatorHash,
      role: UserRole.OPERATOR,
    },
  });

  // Create sample entries if none exist
  const entryCount = await prisma.entry.count();
  if (entryCount === 0) {
    await prisma.entry.create({
      data: {
        entry: 'Abcedário',
        firstDefinition: 'Conjunto das letras de uma língua dispostas por uma ordem convencionada.',
        approvalStatus: ApprovalStatus.APPROVED,
        createdById: admin.id,
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
