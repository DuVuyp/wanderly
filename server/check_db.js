import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.users.findMany()
  const properties = await prisma.properties.findMany()
  const bookings = await prisma.bookings.findMany()

  console.log('USERS:', users.map(u => ({ id: u.id, email: u.email, role: u.role })))
  console.log('PROPERTIES:', properties.map(p => ({ id: p.id, provider_id: p.provider_id })))
  console.log('BOOKINGS:', bookings.map(b => ({ id: b.id, property_id: b.property_id, user_id: b.user_id })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
