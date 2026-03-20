require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const bcrypt = require('bcryptjs') 

async function main() {
  console.log('🌱 Iniciando Seed...')

  // 1. Crear Roles Básicos
  const adminRole = await prisma.roles.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: {
      nombre: 'ADMIN',
      descripcion: 'Administrador del Sistema con acceso total',
    },
  })

  const userRole = await prisma.roles.upsert({
    where: { nombre: 'USER' },
    update: {},
    create: {
      nombre: 'USER',
      descripcion: 'Usuario estándar',
    },
  })

  console.log('✅ Roles creados/verificados')

  // 2. Definir Permisos del Sistema (Módulos)
  const permisos = [
    // Módulo Usuarios
    { slug: 'users:read', descripcion: 'Ver listado y detalles de usuarios' },
    { slug: 'users:create', descripcion: 'Crear nuevos usuarios' },
    { slug: 'users:update', descripcion: 'Editar información de usuarios' },
    { slug: 'users:delete', descripcion: 'Eliminar o desactivar usuarios' },
    
    // Módulo Áreas (Ejemplo para futuro)
    { slug: 'areas:read', descripcion: 'Ver jerarquía de áreas' },
    { slug: 'areas:read_all', descripcion: 'Ver todas las áreas del sistema' },
    { slug: 'areas:write', descripcion: 'Gestionar áreas (crear/editar/borrar)' },

    // Módulo Supervisión
    { slug: 'supervision:read', descripcion: 'Ver asignaciones de supervisión propias' },
    { slug: 'supervision:read_all', descripcion: 'Ver todas las asignaciones de supervisión' },
    { slug: 'supervision:create', descripcion: 'Asignar nuevos supervisores' },
    { slug: 'supervision:update', descripcion: 'Editar asignaciones de supervisión' },
    { slug: 'supervision:delete', descripcion: 'Eliminar asignaciones de supervisión' },
  ]

  for (const p of permisos) {
    const permiso = await prisma.permisos_sistema.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })

    // Asignar todos los permisos al rol ADMIN (para que conste en DB, aunque tenga bypass)
    await prisma.roles_permisos.upsert({
      where: {
        rol_id_permiso_id: {
          rol_id: adminRole.id,
          permiso_id: permiso.id
        }
      },
      update: {},
      create: {
        rol_id: adminRole.id,
        permiso_id: permiso.id
      }
    })
  }
  console.log('✅ Permisos del sistema cargados y asignados a ADMIN')

  // 3. Crear Usuario Admin por defecto
  const adminEmail = 'admin@biometrico.com'
  const adminCedula = '000000000'
  
  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.usuarios.upsert({
    where: { email: adminEmail },
    update: {
      rol_id: adminRole.id // Asegurar que tenga rol ADMIN
    },
    create: {
      nombre: 'Admin',
      apellido: 'Principal',
      email: adminEmail,
      cedula: adminCedula,
      password: hashedPassword,
      rol_id: adminRole.id,
      es_activo: true,
    },
  })
  console.log('✅ Usuario Admin creado (admin@biometrico.com / admin123)')

  // 4. Estados de Asistencia
  // Definimos los estados con sus tipos de evento (DIA, LLEGADA, SALIDA, EXCEPCION)
  const estados = [
    // DIA (Estados principales del día)
    { slug: 'presente', nombre: 'Presente', color_hex: '#10b981', categoria: 'ASISTENCIA', tipo_evento: 'DIA', es_no_laborable: false },
    { slug: 'falta', nombre: 'Falta Injustificada', color_hex: '#ef4444', categoria: 'FALTAS', tipo_evento: 'DIA', es_no_laborable: false },
    { slug: 'incompleto', nombre: 'Marcaje Incompleto', color_hex: '#f97316', categoria: 'ASISTENCIA', tipo_evento: 'DIA', es_no_laborable: false },
    { slug: 'justificado', nombre: 'Justificado', color_hex: '#3b82f6', categoria: 'JUSTIFICADO', tipo_evento: 'DIA', es_no_laborable: true },
    { slug: 'feriado', nombre: 'Feriado', color_hex: '#8b5cf6', categoria: 'JUSTIFICADO', tipo_evento: 'DIA', es_no_laborable: true },
    { slug: 'descanso', nombre: 'Día de Descanso', color_hex: '#3b82f6', categoria: 'JUSTIFICADO', tipo_evento: 'DIA', es_no_laborable: true },
    
    // EXCEPCIONES (Detalles específicos de permisos/novedades)
    { slug: 'vacaciones', nombre: 'Vacaciones', color_hex: '#14b8a6', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'reposo', nombre: 'Reposo Médico', color_hex: '#6366f1', categoria: 'REPOSO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'permiso', nombre: 'Permiso', color_hex: '#8b5cf6', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'licencia', nombre: 'Licencia', color_hex: '#ec4899', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'suspension', nombre: 'Suspensión', color_hex: '#1f2937', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'incapacidad', nombre: 'Incapacidad', color_hex: '#2563eb', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'permiso_remunerado', nombre: 'Permiso Remunerado', color_hex: '#8b5cf6', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },
    { slug: 'permiso_no_remunerado', nombre: 'Permiso No Remunerado', color_hex: '#9ca3af', categoria: 'JUSTIFICADO', tipo_evento: 'EXCEPCION', es_no_laborable: true },

    // LLEGADA (Detalle operativo de llegada)
    { slug: 'llegada_puntual', nombre: 'Llegada Puntual', color_hex: '#10b981', categoria: 'ASISTENCIA', tipo_evento: 'LLEGADA', es_no_laborable: false },
    { slug: 'llegada_tardia', nombre: 'Llegada Tardía', color_hex: '#eab308', categoria: 'TARDANZAS', tipo_evento: 'LLEGADA', es_no_laborable: false },
    { slug: 'sin_llegada', nombre: 'Sin Marca de Llegada', color_hex: '#ef4444', categoria: 'FALTAS', tipo_evento: 'LLEGADA', es_no_laborable: false },

    // SALIDA (Detalle operativo de salida)
    { slug: 'salida_puntual', nombre: 'Salida Puntual', color_hex: '#10b981', categoria: 'ASISTENCIA', tipo_evento: 'SALIDA', es_no_laborable: false },
    { slug: 'salida_temprana', nombre: 'Salida Temprana', color_hex: '#f97316', categoria: 'ASISTENCIA', tipo_evento: 'SALIDA', es_no_laborable: false },
    { slug: 'sin_salida', nombre: 'Sin Marca de Salida', color_hex: '#ef4444', categoria: 'FALTAS', tipo_evento: 'SALIDA', es_no_laborable: false },
  ]

  for (const estado of estados) {
    await prisma.cat_estados_asistencia.upsert({
      where: { slug: estado.slug },
      update: {
        nombre: estado.nombre,
        color_hex: estado.color_hex,
        categoria: estado.categoria,
        tipo_evento: estado.tipo_evento,
        es_no_laborable: estado.es_no_laborable
      },
      create: estado
    })
  }
  console.log('✅ Estados de asistencia cargados con tipos de evento')

  console.log('🏁 Seed finalizado correctamente')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })