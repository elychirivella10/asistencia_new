
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- DIAGNÓSTICO DE ESTADOS ---');
  
  // 1. Obtener estados definidos en catálogo
  const catalogo = await prisma.cat_estados_asistencia.findMany();
  console.log(`Catálogo (${catalogo.length}):`, catalogo.map(c => c.slug));

  // 2. Obtener estados usados en resumen_diario
  const usados = await prisma.resumen_diario.groupBy({
    by: ['estado'],
    _count: { estado: true }
  });
  console.log('Usados en Resumen:', usados);

  // 3. Verificar coincidencias
  const catalogoSlugs = new Set(catalogo.map(c => c.slug));
  const huerfanos = usados.filter(u => !catalogoSlugs.has(u.estado));
  
  if (huerfanos.length > 0) {
    console.warn('⚠️ ALERTA: Hay estados en resumen_diario que NO existen en el catálogo:', huerfanos);
  } else {
    console.log('✅ Todos los estados usados existen en el catálogo.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
