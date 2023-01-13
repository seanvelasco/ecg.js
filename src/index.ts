import { plot } from './plot'
import { documentParser } from './documentParser'

// type Channels = {[key: string]: [number, number]}[][]

class ECG {
    barcode: string
    channels: any
    order: string[][]

    constructor(xml: string, options: { downsample: number, reconstitue: boolean } = { downsample: 0, reconstitue: false }) {

        this.order = [
            ['I', 'AVR', 'V1', 'V4'],
            ['II', 'AVL', 'V2', 'V5'],
            ['III', 'AVF', 'V3', 'V6'],
            ['II']
            // ['I'],
            // ['II'],
            // ['III'],
            // ['AVR'],
            // ['AVL'],
            // ['AVF'],
            // ['V1'],
            // ['V2'],
            // ['V3']            
        ]
        const waveforms = documentParser(xml)

        const convertToCoordinate = (dataset: number[]): [number, number][] => {
            return dataset.map((y, x) => [x, y])
        }

        const groupData = (channels: any) => {

            const slicedData: { [key: string]: number[] | [number, number][] }[][] = []

            for (const labels of this.order) {
                const columns = labels.length
                const temp = []
                let count = 0
                for (const label of labels) {
                    const channel = channels[label] || []
                    console.log(channel) 
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

        console.log(channels)

        // if (options.downsample) { }

        // if (options.reconstitue) {
        //     reconstituteData(channels)
        // }
        const groupedData = groupData(channels)


        this.barcode = barcode
        this.channels = groupedData // convertToCoordinate(groupedData)
    }

    plot = (format: 'svg' | 'jpeg' | 'png' | 'pdf' | 'webp' = 'png', options?: { grid?: string, line?: string, rows: number, columns: number }): any => {


        // console.log(this.channels)
        const image = plot(this.channels, this.order)

        // if (format !== 'svg') {
        //     return await sharp(Buffer.from(image), { density: 1000 }).toFormat('png').toBuffer()
        // }

        return image
    }
}

export default ECG