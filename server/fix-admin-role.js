import prisma from './src/config/prisma.js'

async function main() {
  const email = 'minhnhat@wanderly.com'
  
  const user = await prisma.users.findFirst({
    where: { email }
  })
  
  if (user) {
    console.log(`Current role for ${email}:`, user.role)
    if (user.role !== 'admin') {
      await prisma.users.update({
        where: { id: user.id },
        data: { role: 'admin' }
      })
      console.log(`Successfully updated ${email} to admin role!`)
    } else {
      console.log(`${email} is already an admin.`)
    }
  } else {
    console.log(`User ${email} not found!`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
