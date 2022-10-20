import { plot } from './plot'
import { documentParser } from './documentParser'
import { reconstituteData, groupData, normalizeData } from './treatDataset'
import sharp from 'sharp'

class ECG {
    barcode: string
    channels: { [key: string]: number[] }

    constructor(xml: string, options: { downsample: number, reconstitue: boolean } = { downsample: 0, reconstitue: false }) {

        const waveforms = documentParser(xml)

        const { barcode, channels } = waveforms

        if (options.downsample) { }

        if (options.reconstitue) {
            reconstituteData(channels)
        }

        this.barcode = barcode
        this.channels = channels
    }

    plot = async (format: 'svg' | 'jpeg' | 'png' | 'pdf' | 'webp' = 'png', options?: { grid?: string, line?: string, rows: number, columns: number }): Promise<Buffer> => {

        const groupedLeads = groupData(this.channels)

        const normaalizedData = normalizeData(groupedLeads)

        const image = plot(normaalizedData, [], this.barcode)

        if (format !== 'svg') {
            return await sharp(Buffer.from(image), { density: 500 }).toFormat(format).toBuffer()
        }

        return Buffer.from(image)
    }
}

export default ECG