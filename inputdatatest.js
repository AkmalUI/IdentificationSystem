import { PrismaClient } from './generated/prisma/index.js'
const prisma = new PrismaClient()

async function main() {
  await prisma.product.create({
    data: {
      ItemUID: '9D27B401',
      name: 'landscape',
      screen_count: '3',
    },
  })

  const allItems = await prisma.product.findMany()
  console.dir(allItems, { depth: null })
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
