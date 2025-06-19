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

router.post('/addproducts', async (req, res) => {
  try {
    const { id, name, screencount } = req.body

    const newProduct = await prisma.product.create({
      data: {
        ItemUID: id,
        name: name,
        screen_count: screencount,
      },
    })
    const imageFolderPath = path.join(__dirname, '..', 'public', 'images', name)

    await fs.mkdir(imageFolderPath, { recursive: true }, (err) => {
      if (err) throw err
      console.log('Folder created!')
    })

    res.status(201).json(newProduct)
    await GetID()
  } catch (error) {
    console.error('Error adding product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
