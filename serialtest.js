import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

const port = new SerialPort({
  path: 'COM3',
  baudRate: 115200,
})

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

parser.on('data', (line) => {
  const hostTime = Date.now() // Host time in milliseconds

  if (line.startsWith('TIME:')) {
    const match = line.match(/TIME:([\d-]+\s[\d:]+),UID:(.+)/)
    if (match) {
      const espTimeStr = match[1] + 'Z' // "2025-06-20 14:03:57"
      const uid = match[2]

      const espTimeMs = Date.parse(espTimeStr) // UTC or local depending on system timezone
      const latency = hostTime - espTimeMs // in milliseconds

      console.log(`UID: ${uid} | ESP Time: ${espTimeStr} | Latency: ${latency} ms`)
    } else {
      console.log('Unrecognized format:', line)
    }
  } else {
    console.log('Other:', line)
  }
})
