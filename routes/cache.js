import { PrismaClient } from '../generated/prisma/index.js'
const prisma = new PrismaClient()
let cache = [{}]

export async function GetID() {
  cache = await prisma.product.findMany()
  if (!cache.length) {
    console.log('empty database')
  } else {
    console.log(cache)
  }
}
export { cache }
