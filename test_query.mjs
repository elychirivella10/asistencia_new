import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fromDate = new Date(`2026-03-21T00:00:00.000Z`); // Just a mock range
  const toDate   = new Date(`2026-03-28T23:59:59.999Z`);

  // Query novedades
  const approvedNovedades = await prisma.novedades.findMany({
    where: {
      estado: 'APROBADO',
    },
    select: {
      usuario_id: true,
      fecha_inicio: true,
      fecha_fin: true,
    },
  });

  console.log('Approved Novedades Count:', approvedNovedades.length);
  console.log('Novedades Data:', approvedNovedades);

  // Query resumen_diario for a single user to test the logic
  const singleUserSummary = await prisma.resumen_diario.findMany({
    take: 5,
    select: {
      usuario_id: true,
      fecha: true,
      estado_excepcion_slug: true,
      estado: true
    }
  });

  console.log('\nSample Resumen Diario:', singleUserSummary);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
