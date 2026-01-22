import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton Prisma Client pour éviter les connexions multiples en développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Utiliser le pooling Supabase pour les requêtes
// Support des variables d'environnement Supabase et standard
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL must be defined');
}

// Configuration du pool avec SSL strict (certificat Supabase)
const sslRootCert = process.env.PGSSLROOTCERT?.replace(/\\n/g, '\n');

const pool = globalForPrisma.pool ?? new Pool({
  connectionString,
  ssl: sslRootCert
    ? {
        ca: sslRootCert,
        rejectUnauthorized: true,
      }
    : undefined,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;