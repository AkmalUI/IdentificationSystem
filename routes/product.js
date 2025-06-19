// routes/getproduct.js

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

router.get('/getproducts', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        index: true,
        ItemUID: true,
        name: true,
        screen_count: true,
      },
    })
    res.json(products)
    await GetID()
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/addproducts', async (req, res) => {
  try {
    const { ItemUID, name, screencount } = req.body

    const newProduct = await prisma.product.create({
      data: {
        ItemUID: ItemUID,
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

router.delete('/deleteproducts/:ItemUID', async (req, res) => {
  try {
    const ItemUID = req.params.ItemUID
    const name = req.query.name
    const deletedProduct = await prisma.product.delete({
      where: {
        ItemUID: ItemUID,
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

router.post('/updateproducts', async (req, res) => {
  try {
    const { index, ItemUID, name, screencount } = req.body

    const updateproduct = await prisma.product.update({
      where: {
        index: index,
      },
      data: {
        ItemUID: ItemUID,
        name: name,
        screen_count: screencount,
      },
    })

    res.json(updateproduct)
    await GetID()
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
