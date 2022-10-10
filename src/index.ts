import { plot } from './plot'
import { documentParser } from './documentParser'
import { reconstituteData, groupData, normalizeData } from './treatDataset'

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

    plot = (options?: { grid?: string, line?: string, format?: 'jpeg' | 'png' | 'svg' | 'pdf' }): string => {

        const groupedLeads = groupData(this.channels)

        const normaalizedData = normalizeData(groupedLeads)

        return plot(normaalizedData, [], this.barcode)
    }
}

export default ECG