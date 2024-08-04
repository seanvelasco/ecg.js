import { plot } from './plot'
import { documentParser } from './documentParser'
import sharp from 'sharp'

class ECG {
    barcode: string
    channels: { [key: string]: [number, number][] }[][]
    order: string[][]

    constructor(xml: string, order: string[][], options: { downsample: number, reconstitue: boolean } = { downsample: 0, reconstitue: false }) {

        this.order = order || [
            ['I', 'AVR', 'V1', 'V5'],
            ['II', 'AVL', 'V2', 'V5'],
            ['III', 'AVF', 'V3', 'V6'],
            ['II']
        ]
        const waveforms = documentParser(xml)

        const convertToCoordinate = (dataset: number[]): [number, number][] => {
            return dataset.map((y, x) => [x, y])
        }

        const groupData = (channels: any): { [key: string]: [number, number][] }[][] => {

            const slicedData: { [key: string]: [number, number][] }[][] = []

            for (const labels of this.order) {
                const columns = labels.length
                const temp = []
                let count = 0
                for (const label of labels) {
                    const channel = channels[label] || []
                    const step = channel.length / columns
                    const slice = channel.slice(count * step, (count + 1) * step)
                    temp.push({ [label]: convertToCoordinate(slice) })
                    count++
                }
                slicedData.push(temp)
            }
            return slicedData
        }

        const { barcode, channels } = waveforms

        // if (options.downsample) { }

        // if (options.reconstitue) {
        //     reconstituteData(channels)
        // }
        const groupedData = groupData(channels)



        this.barcode = barcode
        this.channels = groupedData
    }

    plot = async (format: 'svg' | 'jpeg' | 'png' | 'pdf' | 'webp' = 'png'): Promise<any> => {


        const image = plot(this.channels, this.order, [6, 12.5])

        if (format !== 'svg') {
            return await sharp(Buffer.from(image), { density: 720 }).toFormat(format).toBuffer()
        }

        return image
    }
}

export default ECG