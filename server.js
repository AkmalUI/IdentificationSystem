import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { SerialPort } from 'serialport'
import robot from 'robotjs'
import { ReadlineParser } from '@serialport/parser-readline'
import { PrismaClient } from './generated/prisma/index.js' // <-- important: add /index.js if needed in ESM
import showroom from './routes/showroom.js' // <-- extension required in ESM
import ProductRouter from './routes/product.js'
import imageupload from './routes/imageupload.js'
import { GetID } from './routes/cache.js'
import { cache } from './routes/cache.js'

const app = express()
const server = createServer(app)
const io = new Server(server)
const prisma = new PrismaClient()
const port = new SerialPort({
  path: 'COM3',
  baudRate: 115200,
  autoOpen: false,
})

async function openRFID() {
  port.open((err) => {
    if (err) {
      console.error(`Failed to open port: ${err.message}`)
      setTimeout(openRFID, 5000)
    } else {
      console.log('Port opened successfully.')
    }
  })
}

port.open((err) => {
  if (err) {
    console.error(`Failed to open port: ${err.message}`)
  } else {
    console.log('Port opened successfully.')
  }
})

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', (data) => {
  const imgnumber = []
  console.log(data)
  const result = cache.some((obj) => obj.ItemUID === data)
  if (result) {
    const obj = cache.find((entry) => entry.ItemUID === data)
    for (let i = 0; i < obj.screen_count; i++) {
      imgnumber[i + 1] = `/images/${obj.name}/${i + 1}.jpg`
    }
    io.emit('change', imgnumber, obj.screen_count)
  } else {
    robot.typeString(data.trim())
  }
})
app.use(express.static('public'))
app.use('/', showroom)
app.set('view engine', 'ejs')
app.use(express.json())

app.use('/api', ProductRouter)
app.use('/api', imageupload)

server.listen(3000, () => {
  GetID()
  console.log('Server is listening on http://localhost:3000')
})
