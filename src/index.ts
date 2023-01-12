import { plot } from './plot'
import { documentParser } from './documentParser'
import { reconstitue, groupData, normalize } from './treatDataset'
import sharp from 'sharp'

class ECG {
    barcode: string
    channels: { [key: string]: number[] }

    constructor(xml: string, options: { downsample: number, reconstitue: boolean } = { downsample: 0, reconstitue: false }) {

        const waveforms = documentParser(xml)

        const { barcode, channels } = waveforms

        // if (options.downsample) { }

        // if (options.reconstitue) {
        //     reconstituteData(channels)
        // }

        this.barcode = barcode
        this.channels = channels
    }

    plot = (format: 'svg' | 'jpeg' | 'png' | 'pdf' | 'webp' = 'png', options?: { grid?: string, line?: string, rows: number, columns: number }): any => {

        const order = [

            ['I', 'II', 'III', 'AVR', 'AVL', 'AVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'],
            ['I', 'AVR', 'V1', 'V4'],
            ['II', 'AVL', 'V2', 'V5'],
            ['III', 'AVF', 'V3', 'V6'],
            ['II']
        ]

        const image = plot(this.channels, order)

        // if (format !== 'svg') {
        //     return await sharp(Buffer.from(image), { density: 1000 }).toFormat('png').toBuffer()
        // }

        return image
    }
}

export default ECG