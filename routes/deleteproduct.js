import express from 'express'
import { PrismaClient } from '../generated/prisma/index.js'
import { GetID } from './cache.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.delete('/deleteproducts/:id', async (req, res) => {
  try {
    const id = req.params.id
    const name = req.query.name
    const deletedProduct = await prisma.product.delete({
      where: {
        ItemUID: id,
      },
    })

    const imageFolderPath = path.join(__dirname, '..', 'public', 'images', name)

    await fs.rm(imageFolderPath, { recursive: true }, (err) => {
      if (err) throw err
      console.log('Folder created!')
    })

    res.status(200).json(deletedProduct)
    await GetID()
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
