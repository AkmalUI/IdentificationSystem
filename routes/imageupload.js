import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/delete-temp', async (req, res) => {
  try {
    const folderPath = path.join(process.cwd(), 'uploads')
    console.log(folderPath)
    const files = await fs.readdir(folderPath)
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    for (const file of files) {
      try {
        const filePath = path.join(folderPath, file)

        // Only continue if it's a .jpg file
        if (path.extname(file).toLowerCase() === '.jpg') {
          const stat = await fs.stat(filePath)
          if (stat.isFile()) {
            await delay(100) // 100 ms delay
            await fs.unlink(filePath)
            console.log(`Deleted: ${filePath}`)
          }
        }
      } catch (err) {
        console.error(`Failed to delete ${file}:`, err)
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Failed to delete folder contents:', err)
    res.status(500).json({ success: false, error: 'Delete failed' })
  }
})

router.post('/imagedelete', async (req, res) => {
  try {
    const { imageid, device } = req.body
    console.log('imageid:', imageid) // Should be an array of numbers/strings
    console.log('name:', device)
    if (!Array.isArray(imageid) || imageid.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty image list' })
    }

    const deletePromises = imageid.map(async (id) => {
      const imagePath = path.join(process.cwd(), 'public', 'images', device, `${id}.jpg`)
      const outputPath = path.join(process.cwd(), 'uploads', `${id}.jpg`)

      // Delete first image
      try {
        await fs.unlink(imagePath)
        console.log(`Deleted: ${imagePath}`)
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn(`File not found: ${imagePath}`)
        } else {
          console.error(`Failed to delete ${imagePath}:`, err)
        }
      }

      // Delete second image
      try {
        await fs.unlink(outputPath)
        console.log(`Deleted: ${outputPath}`)
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn(`File not found: ${outputPath}`)
        } else {
          console.error(`Failed to delete ${outputPath}:`, err)
        }
      }
    })

    await Promise.all(deletePromises)

    res.json({ success: true, deleted: imageid })
  } catch (error) {
    console.error('Error in imagedelete:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { deviceName, cardId } = req.body

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const inputPath = req.file.path
    const outputDir = path.join(process.cwd(), 'uploads')
    const outputName = `${cardId}.jpg`
    const outputPath = path.join(outputDir, outputName)

    console.log('deviceName:', deviceName)
    console.log('cardId:', cardId)
    console.log('File info:', req.file)

    // Convert and save as .jpg
    await sharp(req.file.buffer).jpeg({ quality: 100 }).toFile(outputPath)

    const imageUrl = `/uploads/${outputName}?${Date.now()}`
    await new Promise((resolve) => setTimeout(resolve, 1000))
    res.json({ success: true, imageUrl })
  } catch (err) {
    console.error('Error during image processing:', err)
    res.status(500).json({ success: false, message: 'Failed to process image' })
  }
})

router.post('/save-image', upload.single('image'), async (req, res) => {
  try {
    const { oldName, name, screen_count } = req.body
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const targetDir = path.join(process.cwd(), 'public', 'images', name)
    const oldDir = path.join(process.cwd(), 'public', 'images', oldName)

    if (oldName && oldName !== name) {
      try {
        await fs.rename(oldDir, targetDir)
        console.log('Renamed folder from', oldName, 'to', name)
      } catch (err) {
        console.error('Rename error:', err)
      }
    }

    // Create target folder if it doesn't exist
    try {
      await fs.access(targetDir)
    } catch {
      await fs.mkdir(targetDir, { recursive: true })
    }

    const files = await fs.readdir(uploadsDir)

    for (const file of files) {
      if (file.endsWith('.jpg')) {
        const oldPath = path.join(uploadsDir, file)
        const newPath = path.join(targetDir, file)

        // Prevent moving into itself
        if (oldPath !== newPath) {
          await fs.rename(oldPath, newPath)
        }
      }
    }

    const maxScreenCount = parseInt(screen_count, 10)
    const maxPossible = 8

    for (let i = maxScreenCount + 1; i <= maxPossible; i++) {
      const deletePath = path.join(targetDir, `${i}.jpg`)
      try {
        await fs.rm(deletePath)
        console.log(`Deleted ${i}.jpg`)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err // rethrow only if not "file not found"
        }
      }
    }

    res.json({ success: true, message: 'Images moved successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
