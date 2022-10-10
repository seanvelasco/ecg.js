import xml2js from 'xml2js'

interface electrocardiogramData {
    barcode: string
    channels: { [key: string]: number[] }
}


// This function is due for a refactor
// Remove dependency to external XML parser

const documentParser = (xml: string | Buffer): electrocardiogramData => {
    let xmlOjbect: any

    xml2js.parseString(xml.toString(), (error, document) => {
        if (error) {
            throw error

        }
        xmlOjbect = document
    })

    const name = xmlOjbect?.sapphire?.dcarRecord[0]?.patientInfo[0]?.name[0]

    const { given, family } = name

    const barcode = xmlOjbect?.sapphire?.dcarRecord[0]?.patientInfo[0]?.identifier[0]?.id[0]?.$?.V || family

    const waveforms = xmlOjbect?.sapphire?.dcarRecord[0]?.patientInfo[0]?.visit[0]?.order[0]?.ecgResting[0]?.params[0]?.ecg[0]?.wav[0]?.ecgWaveformMXG[0]?.ecgWaveform

    const channels: { [key: string]: number[] } = {}

    waveforms.map((waveform: { [key: string]: { [key: string]: string } }) => {
        const { lead, asizeVT, VT, label, V }: { [key: string]: string } = waveform.$
        // Convert sequence of data points encapsulated in a single string into an array of numbers
        const dataPoints = V.split(' ').map((v: string) => parseFloat(v))
        channels[lead] = dataPoints
    })

    return { barcode, channels }
}

export {
    documentParser
}